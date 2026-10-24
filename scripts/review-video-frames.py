"""Export every decoded frame into readable review sheets without changing the film."""
import argparse,hashlib,json
from pathlib import Path
import cv2
import numpy as np
parser=argparse.ArgumentParser();parser.add_argument('video',type=Path);parser.add_argument('destination',type=Path);args=parser.parse_args()
capture=cv2.VideoCapture(str(args.video));assert capture.isOpened(),'Video unavailable'
fps=capture.get(cv2.CAP_PROP_FPS);width=int(capture.get(cv2.CAP_PROP_FRAME_WIDTH));height=int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
args.destination.mkdir(parents=True,exist_ok=True)
cell_width=480;cell_height=round(height*cell_width/width);sheet=None;index=0
while True:
 ok,frame=capture.read()
 if not ok:break
 slot=index%16
 if slot==0:sheet=np.full((cell_height*4,cell_width*4,3),244,dtype='uint8')
 image=cv2.resize(frame,(cell_width,cell_height),interpolation=cv2.INTER_AREA)
 cv2.rectangle(image,(0,0),(116,24),(30,23,5),-1)
 cv2.putText(image,f'{index:03d}  {index/fps:.2f}s',(6,17),cv2.FONT_HERSHEY_SIMPLEX,.45,(255,255,255),1,cv2.LINE_AA)
 y=(slot//4)*cell_height;x=(slot%4)*cell_width;sheet[y:y+cell_height,x:x+cell_width]=image
 if slot==15:cv2.imwrite(str(args.destination/f'frames-{index-15:03d}-{index:03d}.jpg'),sheet,[cv2.IMWRITE_JPEG_QUALITY,94])
 index+=1
if index%16:cv2.imwrite(str(args.destination/f'frames-{index-index%16:03d}-{index-1:03d}.jpg'),sheet,[cv2.IMWRITE_JPEG_QUALITY,94])
capture.release()
metadata=dict(video=str(args.video),sha256=hashlib.sha256(args.video.read_bytes()).hexdigest(),width=width,height=height,fps=fps,frames=index,review_required=True)
(args.destination/'frame-index.json').write_text(json.dumps(metadata,indent=2)+'\n')
print(json.dumps(metadata,indent=2))
