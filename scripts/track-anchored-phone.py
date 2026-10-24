"""Track a partially occluded display between explicitly reviewed corner anchors."""
import argparse
import hashlib
import json
from pathlib import Path

import cv2
import numpy as np


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('video', type=Path)
    parser.add_argument('anchors', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--evidence', type=Path, required=True)
    parser.add_argument('--merge-track', type=Path, help='Fill unanchored frames with separately measured glass geometry.')
    args = parser.parse_args()
    anchors = json.loads(args.anchors.read_text())
    digest = hashlib.sha256(args.video.read_bytes()).hexdigest()
    assert anchors['source_sha256'] == digest
    cap = cv2.VideoCapture(str(args.video)); assert cap.isOpened()
    fps = cap.get(cv2.CAP_PROP_FPS); frames = []
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frames.append(frame)
    cap.release()
    height, width = frames[0].shape[:2]
    assert (width, height, fps) == (anchors['width'], anchors['height'], anchors['fps'])
    points = {int(i): np.asarray(quad, dtype=np.float32) for i, quad in anchors['anchors'].items()}
    keys = sorted(points)
    ranges = anchors.get('visible_ranges', [[keys[0], keys[-1]]])
    assert all(0 <= a <= b < len(frames) and a in points and b in points for a, b in ranges), 'Anchor every visible interval endpoint'
    segments = []
    for start, end in ranges:
        visible_keys = [key for key in keys if start <= key <= end]
        assert max((b-a for a, b in zip(visible_keys, visible_keys[1:])), default=0) <= 16, 'Use anchors at least once per second'
        segments.extend(zip(visible_keys, visible_keys[1:]))
    gray = [cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) for frame in frames]
    measured = [None] * len(frames); fallback_frames = []
    for a, b in segments:
        predicted = [points[a].copy()]
        for index in range(a + 1, b + 1):
            quad = predicted[-1]
            mask = np.zeros((height, width), dtype=np.uint8)
            x, y, w, h = cv2.boundingRect(quad)
            margin = 8
            mask[max(0, y-margin):min(height, y+h+margin), max(0, x-margin):min(width, x+w+margin)] = 255
            features = cv2.goodFeaturesToTrack(gray[index-1], 100, .005, 2, mask=mask)
            matrix = None
            if features is not None and len(features) >= 6:
                target, status, error = cv2.calcOpticalFlowPyrLK(gray[index-1], gray[index], features, None,
                                                              winSize=(15, 15), maxLevel=3)
                valid = (status.ravel() == 1) & (error.ravel() < 25)
                if valid.sum() >= 6:
                    matrix, _ = cv2.estimateAffine2D(features[valid], target[valid], method=cv2.RANSAC,
                                                     ransacReprojThreshold=2, maxIters=1000)
            if matrix is None:
                fallback_frames.append(index)
                predicted.append(quad.copy())
            else:
                predicted.append(cv2.transform(quad[None], matrix)[0])
        # Small optical-flow drift is corrected by the next measured anchor.
        correction = points[b] - predicted[-1]
        for step, quad in enumerate(predicted):
            measured[a + step] = quad + correction * (step / (b-a))
    merged_count = 0
    if args.merge_track:
        other = json.loads(args.merge_track.read_text())
        assert other['source_sha256'] == digest and len(other['frames']) == len(frames)
        for index, quad in enumerate(other['frames']):
            if measured[index] is None and quad is not None:
                measured[index] = (np.asarray(quad) * [width, height]).astype('float32')
                merged_count += 1
    for quad in measured:
        if quad is None:
            continue
        assert np.isfinite(quad).all() and cv2.isContourConvex(quad)
        assert cv2.contourArea(quad) > 15, 'Degenerate phone plane'
    normalized = [None if quad is None else (quad / [width, height]).round(7).tolist() for quad in measured]
    result = dict(width=width, height=height, fps=fps, frame_count=len(frames), frames=normalized,
                  source=args.video.name, source_sha256=digest, review_required=True,
                  measured_frames=len(keys)+merged_count, interpolated_frames=sum(quad is not None for quad in measured)-len(keys)-merged_count,
                  merged_measured_frames=merged_count,
                  visible_ranges=ranges,
                  anchors_sha256=hashlib.sha256(args.anchors.read_bytes()).hexdigest(),
                  detection='Manual glass-corner anchors with local optical flow and endpoint drift correction',
                  flow_fallback_frames=fallback_frames)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, separators=(',', ':')) + '\n')
    # Every frame, enlarged around the phone, for geometry review.
    tiles = []
    for index, frame in enumerate(frames):
        quad = measured[index]
        if quad is None:
            continue
        center = quad.mean(0)
        extent = max(np.ptp(quad[:, 0]), np.ptp(quad[:, 1])) * .8
        size = max(50, int(extent * 2))
        sample = frame.copy(); cv2.polylines(sample, [quad.round().astype('int32')], True, (30, 250, 80), 1)
        patch = cv2.getRectSubPix(sample, (size, size), tuple(center.astype(float)))
        patch = cv2.resize(patch, (240, 240)); cv2.putText(patch, str(index), (8, 21), cv2.FONT_HERSHEY_SIMPLEX, .55, (0, 0, 0), 3); cv2.putText(patch, str(index), (8, 21), cv2.FONT_HERSHEY_SIMPLEX, .55, (255, 255, 255), 1)
        tiles.append(patch)
    args.evidence.mkdir(parents=True, exist_ok=True)
    for start in range(0, len(tiles), 24):
        sheet = np.full((4*240, 6*240, 3), 240, dtype='uint8')
        for i, tile in enumerate(tiles[start:start+24]):
            y, x = (i//6)*240, (i%6)*240; sheet[y:y+240, x:x+240] = tile
        cv2.imwrite(str(args.evidence / f'phone-geometry-{start:03d}.jpg'), sheet)
    print('Anchored tracking prepared; review every phone geometry tile before approving.', result['flow_fallback_frames'])


if __name__ == '__main__':
    main()
