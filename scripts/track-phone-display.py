"""Measure the blank phone plane for native UI compositing; never changes source footage.

Requires opencv-python-headless/numpy in an isolated tooling environment. Outputs
frame-indexed geometry, confidence, and a review contact sheet of detected corners.
"""
import argparse
import hashlib
import json
from pathlib import Path

import cv2
import numpy as np


def ordered(points):
    points = np.asarray(points, dtype=float)
    center = points.mean(0)
    points = points[np.argsort(np.arctan2(points[:, 1] - center[1], points[:, 0] - center[0]))]
    points = np.roll(points, -np.argmin(points.sum(1)), axis=0)
    edges = np.linalg.norm(np.roll(points, -1, axis=0) - points, axis=1)
    if edges[0] + edges[2] > edges[1] + edges[3]:
        points = np.roll(points, -1, axis=0)
    return points


def plane_from_mask(component):
    contours = cv2.findContours(component, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0]
    if not contours:
        return None
    contour = max(contours, key=cv2.contourArea)
    hull = cv2.convexHull(contour)
    perimeter = cv2.arcLength(hull, True)
    quad = None
    for fraction in [.02, .025, .03, .04, .05]:
        candidate = cv2.approxPolyDP(hull, fraction * perimeter, True).reshape(-1, 2)
        if len(candidate) == 4:
            quad = ordered(candidate)
            break
    if quad is None:
        return None
    points = contour[:, 0, :].astype(float)
    lines = []
    for i in range(4):
        a, z = quad[i], quad[(i + 1) % 4]
        v = z - a
        t = (points - a) @ v / (v @ v)
        offsets = points - a
        distance = np.abs(v[0] * offsets[:, 1] - v[1] * offsets[:, 0]) / np.linalg.norm(v)
        selected = points[(t > .14) & (t < .86) & (distance < max(8, perimeter * .014))]
        if len(selected) < 8:
            return None
        vx, vy, x, y = cv2.fitLine(selected.astype('float32'), cv2.DIST_HUBER, 0, .01, .01).ravel()
        lines.append(np.cross([x, y, 1], [x + vx, y + vy, 1]))
    # A supporting thumb can replace the bottom boundary with its diagonal silhouette.
    # In that case infer the near-parallel glass edge from the lowest visible glass.
    a, b = lines[0][:2], lines[2][:2]
    angle = np.arccos(np.clip(abs(a @ b) / (np.linalg.norm(a) * np.linalg.norm(b)), 0, 1))
    if angle > np.deg2rad(8):
        normal = lines[0][:2] / np.linalg.norm(lines[0][:2])
        if normal[1] < 0:
            normal = -normal
        bottom = float(np.quantile(points @ normal, .985))
        lines[2] = np.r_[normal, -bottom]
    result = []
    for i in range(4):
        p = np.cross(lines[(i - 1) % 4], lines[i])
        if abs(p[2]) < 1e-8:
            return None
        result.append(p[:2] / p[2])
    result = np.asarray(result)
    if not cv2.isContourConvex(result.astype('float32')):
        return None
    return result


def find_display(bgr, previous=None):
    height, width = bgr.shape[:2]
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(float)
    r, g, b = np.moveaxis(rgb, 2, 0)
    mask = ((r > 218) & (g > 210) & (b > 180) & ((r - g) < 35) & ((r - b) < 72)).astype('uint8')
    # This is a measured shot-specific search region, not a generic phone recognizer.
    left, right, top, bottom = 0, width, 0, height
    mask[:, :left] = 0; mask[:, right:] = 0; mask[:top] = 0; mask[bottom:] = 0
    count, labels, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
    candidates = []
    target = np.array([width * .445, height * .43]) if previous is None else previous.mean(0)
    for label in range(1, count):
        x, y, w, h, area = stats[label]
        if area < width * height * .0015 or max(h, w) < height * .16 or min(h, w) < width * .012:
            continue
        if not .15 < h / w < 12 or area / (w * h) < .35:
            continue
        if x <= left or x + w >= right or y <= top or y + h >= bottom:
            continue
        quad = plane_from_mask((labels == label).astype('uint8'))
        if quad is None:
            continue
        if previous is not None and np.linalg.norm(np.roll(quad, 2, axis=0) - previous) < np.linalg.norm(quad - previous):
            quad = np.roll(quad, 2, axis=0)
        edge_lengths = np.linalg.norm(np.roll(quad, -1, axis=0) - quad, axis=1)
        # A tilted portrait display may have a nearly square axis-aligned box.
        # Check its physical edges rather than rejecting that valid camera pose.
        if not 1.3 < (edge_lengths[1] + edge_lengths[3]) / (edge_lengths[0] + edge_lengths[2]) < 15:
            continue
        distance = np.linalg.norm(quad.mean(0) - target) / width
        # A single 16 fps frame cannot move the held display across a third of
        # the image. Reject distant lake glints before short-gap interpolation.
        if previous is not None and distance > .08:
            continue
        score = area / (width * height) - distance * .15
        candidates.append((score, quad))
    return max(candidates, key=lambda item: item[0])[1] if candidates else None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('video', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--from-time', type=float, default=4.5)
    parser.add_argument('--evidence', type=Path)
    parser.add_argument('--fill-gaps', type=int, default=3, help='Interpolate only short internal glint gaps between valid measured planes.')
    args = parser.parse_args()
    capture = cv2.VideoCapture(str(args.video))
    assert capture.isOpened(), 'Video is unavailable'
    fps = capture.get(cv2.CAP_PROP_FPS)
    frames = []
    while True:
        ok, frame = capture.read()
        if not ok:
            break
        frames.append(frame)
    capture.release()
    assert frames and fps > 0
    height, width = frames[0].shape[:2]
    measured = [None] * len(frames)
    previous = None
    for index in range(len(frames) - 1, max(-1, int(args.from_time * fps) - 1), -1):
        quad = find_display(frames[index], previous)
        if quad is not None:
            measured[index] = quad
            previous = quad
    interpolated = 0
    valid = [i for i, quad in enumerate(measured) if quad is not None]
    for a, b in zip(valid, valid[1:]):
        if 1 < b - a <= args.fill_gaps + 1:
            for index in range(a + 1, b):
                weight = (index - a) / (b - a)
                measured[index] = measured[a] * (1 - weight) + measured[b] * weight
                interpolated += 1
    normalized = [None if quad is None else (quad / [width, height]).round(7).tolist() for quad in measured]
    result = dict(width=width, height=height, fps=fps, frame_count=len(frames),
                  source=args.video.name, frames=normalized,
                  source_sha256=hashlib.sha256(args.video.read_bytes()).hexdigest(),
                  measured_frames=sum(p is not None for p in normalized),
                  interpolated_frames=interpolated,
                  review_required=True, detection='shot-specific blank-glass segmentation and edge fitting')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, separators=(',', ':')) + '\n')
    if args.evidence:
        samples = []
        for index in range(int(args.from_time * fps), len(frames), max(1, round(fps / 2))):
            sample = frames[index].copy()
            quad = measured[index]
            if quad is not None:
                cv2.polylines(sample, [np.rint(quad).astype('int32')], True, (60, 230, 90), 2)
            cv2.putText(sample, f'{index / fps:.2f}s', (14, 30), cv2.FONT_HERSHEY_SIMPLEX, .7, (255, 255, 255), 2)
            samples.append(cv2.resize(sample, (480, round(height * 480 / width))))
        columns, row_height = 3, samples[0].shape[0]
        rows = (len(samples) + columns - 1) // columns
        sheet = np.full((rows * row_height, columns * 480, 3), 245, dtype='uint8')
        for i, sample in enumerate(samples):
            y, x = (i // columns) * row_height, (i % columns) * 480
            sheet[y:y + row_height, x:x + 480] = sample
        args.evidence.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(args.evidence), sheet)
    print(f'Measured {result["measured_frames"]}/{len(frames)} frames; inspect geometry before use.')


if __name__ == '__main__':
    main()
