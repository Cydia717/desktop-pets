from PIL import Image, ImageDraw
from pathlib import Path
import math
out=Path(__file__).parent
for action in ['blink','sleep','walk','look']:
    im=Image.new('RGB',(2048,1024),'white');d=ImageDraw.Draw(im)
    for i in range(8):
        x=(i%4)*512;y=(i//4)*512
        bob=3*math.sin(i*math.tau/8)
        if action=='walk':
            phase=i*math.tau/8
            d.ellipse((x+160,y+230+bob,x+315,y+415+bob),fill='#a0a0a0',outline='#333333',width=3)
            d.ellipse((x+190,y+75+bob,x+355,y+250+bob),fill='#a0a0a0',outline='#333333',width=3)
            d.ellipse((x+300,y+160+bob,x+390,y+225+bob),fill='#a0a0a0',outline='#333333',width=3)
            d.line([(x+180,y+365),(x+105,y+390),(x+55,y+345)],fill='#888888',width=35)
            for near in [False,True]:
                step=math.sin(phase+(0 if near else math.pi))*43
                lift=max(0,math.cos(phase+(0 if near else math.pi)))*20
                hip=(x+245,y+370);foot=(x+245+step,y+455-lift)
                d.line([hip,(x+245+step*.55,y+410),foot],fill='#aaaaaa' if near else '#666666',width=38)
                d.ellipse((foot[0]-15,foot[1]-10,foot[0]+38,foot[1]+10),fill='#aaaaaa' if near else '#666666')
        else:
            seated=action=='sleep';head_y=95+(50 if seated else 0)+bob
            d.ellipse((x+175,y+260+(45 if seated else 0),x+337,y+430),fill='#a0a0a0',outline='#333333',width=3)
            d.rounded_rectangle((x+147,y+head_y,x+365,y+head_y+200),radius=90,fill='#aaaaaa',outline='#333333',width=3)
            d.ellipse((x+178,y+420,x+242,y+459),fill='#aaaaaa');d.ellipse((x+272,y+420,x+336,y+459),fill='#aaaaaa')
            for arm in [-1,1]:d.ellipse((x+246+arm*85-20,y+300,x+246+arm*85+20,y+355),fill='#999999')
            eye= [1,.6,.15,0,.15,.6,1,1][i] if action=='blink' else (0 if seated else 1)
            gaze=[(-7,-5),(0,-7),(7,-5),(9,0),(7,5),(0,7),(-7,5),(-9,0)][i] if action=='look' else (0,0)
            for ex in [210,303]:
                yy=y+head_y+104
                if eye==0:d.line((x+ex-10,yy,x+ex+10,yy),fill='#222222',width=4)
                else:d.ellipse((x+ex-8+gaze[0],yy-eye*12+gaze[1],x+ex+8+gaze[0],yy+eye*12+gaze[1]),fill='#222222')
    im.save(out/f'{action}.png')
