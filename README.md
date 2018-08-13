# dndne
a simple editor with drag and drop function

### 需求设计
#### step1: 
1、class为draggable的元素点击后在点击处生成可被拖拽的元素，并隐藏原元素（假如点击的是签章，则生成的dndne要加上一个class：signature）
2、移动该元素到指定区域松开鼠标可将此元素添加至指定区域，如移到指定区域外，则销毁此元素。
3、上一步操作后恢复原元素
#### step2: 
1、新生成的元素命名class为dndne. dndne分3个部分，内容：content 边框：border 圆点：stick(签章的话就只有四个角的圆点)
2、内容是根据点击原始元素获取的；边框在dndne为active时才会显示，用::before伪类来设计；stick有6个，采用绝对定位，在dndne为active时显示、
3、关于stick，6个点分别命名如下：
  stick-tl
  stick-tr
  stick-l
  stick-r
  stick-bl
  stick-br
  四个角的圆点点击后可缩放该dndne（假如要监听字体大小的话可以根据原字体大小*缩放比例计算得到）
  左右两个角的圆点点击后可拉伸该dndne

  #### 函数设计规则
  尽量保证每个函数只做一件事

