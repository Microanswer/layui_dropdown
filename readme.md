一、简介预览

`dropdown` 是一款基于layui框架的下拉框控件，填补了layui原生没有下拉框这个空隙。借助下拉框的操作方式和UI交互，可以带来更加直观、便于操作、模块划分清晰等优势。不妨先看看本控件的预览效果：

 |默认|中对齐|右对齐|
 |----|----|----|
 |![](https://file.microanswer.cn/%E9%BB%98%E8%AE%A4.png)|![](https://file.microanswer.cn/dropdown_%E4%B8%AD%E5%AF%B9%E9%BD%90.png)|![](https://file.microanswer.cn/dropdown_%E5%8F%B3%E5%AF%B9%E9%BD%90.png)|
 
 
 |hover|自定义下拉|任意触发器|
 |----|----|----|
 |![](https://file.microanswer.cn/dropdown_hover%E7%9A%84%E4%B8%8B%E6%8B%89%E8%8F%9C%E5%8D%95.png)|![](https://file.microanswer.cn/dropdown_%E8%87%AA%E5%AE%9A%E4%B9%89%E4%B8%8B%E6%8B%89%E5%86%85%E5%AE%B9.png)|![](https://file.microanswer.cn/dropdown_%E4%BB%BB%E6%84%8F%E8%A7%A6%E5%8F%91%E5%99%A8.png)|
 
 二、安装
 
 只需要[点击下载]()将JavaScript文件解压到layui的lay目录，或者放在你的layui扩展目录，然后将css文件找一个自己喜欢的目录，最后将其引入html文件里即可开始使用。
 
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
            // 如果你把 dropdown.js 放在了 layui 的lay目录，你可以直接:
            layui.use(['dropdown'], function () {
                var dropdown = layui.dropdown;
                // ...其它业务代码
            });

            // =====================================================================
            
            // 如果你把 dropdown.js 放在了你的扩展控件目录，你可以:
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

 三、详细使用