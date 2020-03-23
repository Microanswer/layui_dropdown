### 一、简介预览

`dropdown` 是一款基于layui框架的下拉框控件，填补了layui原生没有下拉框这个空隙。借助下拉框的操作方式和UI交互，可以带来更加直观、便于操作、模块划分清晰等优势。带来了这些优势的同时又加入了许多意想不到的细节:

- 如果下拉框出现的位置会超出浏览器边缘，那么会自动找一个‘凉快’的地方呆着。
- 在你打开下拉框后又进行了界面滚动，她也不依不舍的跟着你走。

那么先不妨先看看本控件的预览效果：

 |左对齐|中对齐|右对齐|
 |----|----|----|
 |![](https://file.microanswer.cn/%E9%BB%98%E8%AE%A4.png)|![](https://file.microanswer.cn/dropdown_%E4%B8%AD%E5%AF%B9%E9%BD%90.png)|![](https://file.microanswer.cn/dropdown_%E5%8F%B3%E5%AF%B9%E9%BD%90.png)|
 
 
 注意：分割线、菜单头功能自版本(v1.0.1)加入。
 
 |分割线|菜单头|带横线的菜单头|
 |----|----|----|
 |![](https://file.microanswer.cn/dropdown_%E5%88%86%E5%89%B2%E7%BA%BF.png)|![](https://file.microanswer.cn/dropdown_%E8%8F%9C%E5%8D%95%E5%A4%B4.png)|![](https://file.microanswer.cn/dropdown_%E8%8F%9C%E5%8D%95%E5%A4%B42.png)|
 
 
 |hover|自定义下拉|任意触发器|
 |----|----|----|
 |![](https://file.microanswer.cn/dropdown_hover%E7%9A%84%E4%B8%8B%E6%8B%89%E8%8F%9C%E5%8D%95.png)|![](https://file.microanswer.cn/dropdown_%E8%87%AA%E5%AE%9A%E4%B9%89%E4%B8%8B%E6%8B%89%E5%86%85%E5%AE%B9.png)|![](https://file.microanswer.cn/dropdown_%E4%BB%BB%E6%84%8F%E8%A7%A6%E5%8F%91%E5%99%A8.png)|
 
  
要立刻体验？可以[点击此处](http://test.microanswer.cn/dropdown.html)立即在线体验。
 
 ### 二、安装
 
 只需要[点击下载](http://file.microanswer.cn/dropdown_1.0.1.zip?a)将JavaScript文件解压到你的layui扩展目录，然后将css文件找一个自己喜欢的目录，最后将其引入html文件里即可开始使用。
 
 下面示例页面中如何使用：
 
 ```html
<html>
    <head>
        <title>dropdown</title>
        <link type="text/css" rel="stylesheet" href="假设这是你原本layui的css目录/layui.css">
        <link type="text/css" rel="stylesheet" href="你放css的目录/dropdown.css">
    </head>
    <body>
        <button class="layui-btn layui-btn-sm" 
                lay-filter="test1"
                lay-dropdown="{menus: [{layIcon:'layui-icon-username',txt: '个人中心', event:'usercenter'}, {layIcon: 'layui-icon-set',txt: '设置', event:'set'}, {layIcon: 'layui-icon-logout', txt: '退出登录', event:'loginout'}]}">
            <span>下拉菜单</span>
            <i class="layui-icon layui-icon-triangle-d"></i>
        </button>
        
        <script>
                       
            // 把 dropdown.js 放在了你的扩展控件目录，你可以:
            layui.config({
                base: '你的扩展目录'
            }).use(['dropdown'], function () {
                var dropdown = layui.dropdown;
                
                // 监听菜单点击
                dropdown.onFilter('test1', function (event) {
                    // ...业务代码                    
                })
               
            });
        </script>
    </body>
</html>
```

 ### 三、详细使用
 
 #### 1、开启下拉
 
 你需要某个按钮(或dom)点击它时它可以下拉展开一个菜单时，你只需要为这个按钮添加`lay-dropdown`属性，在后面填写相应的配置。刷新页面，你就可以点击这个按钮实现下拉框了。是不是很简单。就像这样：
 
 ```html
<button class="layui-btn layui-btn-sm" 
                lay-filter="test1"
                lay-dropdown="{menus: [{layIcon:'layui-icon-username',txt: '个人中心', event:'usercenter'}, {layIcon: 'layui-icon-set',txt: '设置', event:'set'}, {layIcon: 'layui-icon-logout', txt: '退出登录', event:'loginout'}]}">
            <span>下拉菜单</span>
            <i class="layui-icon layui-icon-triangle-d"></i>
</button>
<script>
layui.config({
    base: '你的扩展目录'
}).config({
    base: '你的扩展目录'
}).use(['dropdown'], function () {

});
</script> 
```

你或许注意到了，通过给`lay-dropdown`传入一个包含菜单条目`menus`的对象，就可以立即实现下拉菜单的功能了。有关这个对象的具体内容，请往下看。

#### 2、监听点击事件

要监听下拉菜单的点击事件，使用`dropdown.onFilter`方法即可监听，示例代码如下:

```html
<script>
layui.config({
    base: '你的扩展目录'
}).use(['dropdown'], function () {
    var dropdown = layui.dropdown;
    
    // test1 就是触发下拉的按钮的lay-filter属性的内容
    dropdown.onFilter("test1", function (event) {
        // 根据上一节的配置来说，这里的event可能为：
        // usercenter、set、loginout
        // 这就取决于你点击的是哪一个菜单项了。
        console.log(event); 
    });
});
</script> 
```

`dropdown.onFilter`方法提供了两个参数，第一个是确定多个下拉框唯一性的`lay-filter`值，第二个就是回调函数，这个回调函数会传入一个`event`，通过它你就可以知道点击的具体是哪一个菜单条目了。

#### 3、自定义下拉内容

这无疑是此下拉控件最具光荣的功能，通过它你可以实现任何你希望的下拉内容，这一刻就是你颅内高潮的moment。

通过配置一个参数`template`，传入你的布局模板，就可以实现下拉框显示自定义内容了：

```html
<button
 class="layui-btn layui-btn-sm"
 lay-dropdown="{template: '#custMenu'}"
>
    <span>自定义下拉内容</span>
    <i class="layui-icon layui-icon-triangle-d"></i>
</button>

<!-- 下拉内容自定义模板 -->
<script id="custMenu" type="text/html">
    <div>
        <p>我是自定义下拉内容</p>
    </div>
</script>

<script>
layui.use(['dropdown'], function () {
    var dropdown = layui.dropdown;
});
</script>
```

#### 4、使用代码初始化

当然了，不可能每个下拉框都是在页面出现就跟随立即出现，有很多时候我们需要把下拉框通过后期进行初始化。常见的场景就是在表格里，我们则需要在表格的`done`函数里进行初始化。
这就不得不通过代码来初始化了，通过代码初始化，不仅可以带来`html`布局上的精简，还可以拥有更强大的功能和自定义效果。

下面示例了如何进行异步初始化：

```html
<!-- 使用代码 -->
<button class="layui-btn layui-btn-sm" id="mybtn">异步初始化下拉</buton>

<script>
    layui.config({
        base: '你的扩展目录'
    }).use(['dropdown'], function () {
        var dropdown = layui.dropdown;
        // 通过代码(也就是后期异步初始化)进行初始化下拉

        // 这样可以把 mybtn 实现下拉菜单 
        dropdown.suite("#mybtn", {
            menus: [{txt: "按钮1"}, {txt: "按钮2"}]
        });

        // 这样可以把 mybtn 实现下拉自定义内容  
        dropdown.suite("#mybtn", {
            template: "xxxx自定义模板id",
            success: function ($dom) {
                // 当自定义内容模板初始化完成
                // 此方法会调用. 传入的$dom就
                // 包含了你的模板的内容，通过它
                // 你可以在这里进行模板内其他组
                // 件的初始化。
            }
        });
    });
</script>
```
可以看到`suite`方法帮我们完成了下拉初始化，它又两个参数，第一个参数是一个dom选择器，第二个参数是一个`option`配置，关于`option`详细内容，请看最后一节。

### 四、api列表

#### 1、dropdown.suite(selector, option)

代码初始化下拉框，通过参数`selector`确定哪一个按钮触发下拉框。`option`为下拉框配置，配置见下一节。

#### 2、dropdown.onFilter(filter, cb)

监听菜单点击事件，通过它可以监听使用`menus`配置的菜单条目点击事件。对于自定义下拉模板内的dom点击事件，可通过`option`提供的`success`回调函数进行监听，详见下一节`option`配置说明。

### 五、lay-dropdown配置详解

无论是通过在html上直接通过属性`lay-dropdown`来进行配置，还是通过代码`suite`方法进行初始化配置，它们传递的配置参数都适用于本节内容:

```javascript
var option = {
    
    // 【可选】对齐方式，默认left，可填：left,center,right
    align: "left",
    
    // 【与menus两者必填一个】自定义下拉模板id
    // 如果同时配置了 menus，则优先 menus 作为下拉内容。
    template: "",

    // 【可选】当你使用template自定义模板时，支持通过此
    // data 向模板里提供数据，从而实现动态渲染。
    data: {},
    
    // 【与template两者必填一个】下拉菜单项，数组。
    menus: [
        ...
        
        // 分割线 (v1.0.1)
        "hr",

        // 菜单头 (v1.0.1)
        {
            // 菜单头文案内容
            header: "通用",
                        
            // 菜单头文案对齐方式, 可填:left(默认),center,right
            align: "left",

            // 是否启用带横线的菜单头。当设置为true时，align字段属性不会生效。
            withLine: false    
        },

        // 普通按钮项
        {
            // 菜单图标，示例: layui-icon-heart-fill
            // layui图标大全：https://www.layui.com/doc/element/icon.html
            layIcon: "",
            // 菜单显示文字
            txt: "",
            // 点击此菜单的事件
            event: ""
        },
        ...
    ],
    
    // 【可选】如果发现下拉框显示出来后被遮挡了
    // 通过把此配置值修改大于遮挡层的zindex就好了
    zIndex: 102,

    // 【可选】触发下拉框的方式，可填: click, hover
    showBy: "click",

    // 【可选】下拉框最小宽度
    minWidth: 10,

    // 【可选】下拉框最小高度
    minHeight: 10,
    
    // 【可选】下拉框最大高度
    maxHeight: 300,

    // 【可选】下拉框与触发按钮的间隙大小
    gap: 4,

    // 【可选】多个下拉框确定唯一性的，和属性 lay-filter 一个作用
    filter: "",
    
    // 【可选】通过template参数自定义下拉内容时
    // 模板渲染成功此方法调用，$dom: 包含你的自定义模板的jquery对象。
    success: function ($dom) {}
}
```

### 六、网站

博文：[点击前往](https://www.microanswer.cn/blog/74)。

不错，去网站：([microanswer.cn](https://www.microanswer.cn))点个赞。