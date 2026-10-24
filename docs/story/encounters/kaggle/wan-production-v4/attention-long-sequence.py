import os,time,json
os.environ['CUDA_VISIBLE_DEVICES']='1'
import torch
import torch.nn.functional as F
from sageattention import sageattn_varlen
rows=[]
with torch.inference_mode():
 for n in [8192,42840]:
  for bias in [0,4]:
   torch.manual_seed(2921)
   q,k,v=[torch.randn((n,2,128),device='cuda',dtype=torch.float16) for _ in range(3)]
   q.add_(bias);k.add_(bias)
   cu=torch.tensor([0,n],device='cuda',dtype=torch.int32)
   try:
    torch.cuda.synchronize();start=time.perf_counter()
    reference=F.scaled_dot_product_attention(q.transpose(0,1).unsqueeze(0),k.transpose(0,1).unsqueeze(0),v.transpose(0,1).unsqueeze(0))[0].transpose(0,1)
    torch.cuda.synchronize();sdpa_seconds=time.perf_counter()-start
    start=time.perf_counter();output=sageattn_varlen(q,k,v,cu,cu,n,n);torch.cuda.synchronize()
    a=reference.float();b=output.float()
    rows.append(dict(tokens=n,bias=bias,sdpa_seconds=sdpa_seconds,sage_seconds=time.perf_counter()-start,relative_error=float((a-b).norm()/a.norm()),cosine=float(F.cosine_similarity(a.flatten(),b.flatten(),dim=0)),finite=bool(torch.isfinite(b).all())))
    del reference,output,a,b
   except torch.OutOfMemoryError:
    rows.append(dict(tokens=n,bias=bias,status='reference comparison exceeded GPU memory'))
   del q,k,v,cu;torch.cuda.empty_cache()
print(json.dumps(rows,indent=2),flush=True)
