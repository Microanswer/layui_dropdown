
if (!Array.isArray) {
    Array.isArray=function(obj){
        return Object.prototype.toString.call(obj)==="[object Array]";
    }
}
if (!String.prototype.trim) {
    String.prototype.trim = function () {return this.replace(/(^\s*)|(\s*$)/g, "");};
}
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
        }
        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(
                    this instanceof fNOP && oThis ? this : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments))
                );
            };
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}

/**
 * @Name ${name}
 * @Author: ${author}
 * @License: ${license}
 * @Version: ${version}
 */
layui.define(['jquery', 'laytpl'], function (exports) {
    var version = "${version}";
    var $       = layui.jquery || layui.$;
    var laytpl  = layui.laytpl;


    // === 内部事件模块, 由于layui不让同一事件注册多次监听了，故此处自己实现。 ===>
    var EVENT = {
        DROPDOWN_SHOW: "a",
        DROPDOWN_ITEM_CLICK: "b",
    };

    // 内部事件。目前仅仅有一个打开下拉框事件。此事件不暴露给开发者，仅作为内部使用。
    var INNER_EVENT = {};

    // 监听指定事件。
    var onEvent = function (event, cb) {
        var evnts = INNER_EVENT[event] || [];
        evnts.push(cb);
        INNER_EVENT[event] = evnts;
    };

    // 发出事件
    var makeEvent = function (event, param) {
        var evnts = INNER_EVENT[event] || [];
        $.each(evnts, function (index, value) {
            value(param);
        });
    };
    // <=== 内部事件模块 ===================================================

    var parseTemplateMenuStatuMap = {
        FIND_MENU: "1",
        FIND_MENU_ITEM:"2",
        FIND_MENU_ITEM_CONTENT: "3"
    };

    /**
     * 解析单个菜单配置。
     * @param itemStr 巴拉拉啦！变身！。
     */
    function parseTemplateMenuItem(itemStr) {
        if (!itemStr) {
            throw new Error("菜单条目内必须填写内容。");
        }
        if ("hr" === itemStr) {
            return "hr";
        } else if (itemStr.indexOf("{") === 0){
            var f = new Function("return " + itemStr);
            return f();
        } else {
            throw new Error("除了分割线hr，别的菜单条目都必须保证是合格的Javascript对象或json对象。");
        }
    }

    // 移除数组中的空项。
    function removeEmptyItem(arr) {
        // ie8， 如果遇到空元素，移除。
        for (var i = 0; i < arr.length; i++) {
            if (typeof arr[i] === 'undefined' || arr[i] === null){
                arr.splice(i, 1);
                i--;
            }
        }
    }

    /**
     *  将模板菜单格式化为可用于dom的html。
     *
     *  [hr] 横线
     *  [{header: "通用", align: "left", withLine: true}] 菜单头
     *  [{layIcon: "", txt: "", event: ""}] 菜单
     */
    function parseTemplateMenu(html, sptor) {
        if (!html) {return "";}
        if (!sptor) { throw new Error("请指定菜单模板限定符。");}

        var sptor1 = sptor.charAt(0);
        var sptor2 = sptor.charAt(1);

        var totalLength = html.length;
        var currentIndex = 0;

        var parseStatus = parseTemplateMenuStatuMap.FIND_MENU;
        var meaning = false; // 用此字段表示当前是否处于转义状态，转义状态时，下一个字符就按原样输出。

        var menus = [];
        var menu;
        var item;
        while (currentIndex < totalLength) {
            var currentChar = html.charAt(currentIndex);

            if (parseStatus === parseTemplateMenuStatuMap.FIND_MENU && !meaning) {
                if (sptor1 === currentChar) {
                    menu = [];
                    menus.push(menu);
                    parseStatus = parseTemplateMenuStatuMap.FIND_MENU_ITEM;
                }
            } else if (parseStatus === parseTemplateMenuStatuMap.FIND_MENU_ITEM && !meaning) {
                if (sptor1 === currentChar) {
                    item = {srcStr: ""};
                    parseStatus = parseTemplateMenuStatuMap.FIND_MENU_ITEM_CONTENT;
                } else if (sptor2 === currentChar) {
                    parseStatus = parseTemplateMenuStatuMap.FIND_MENU;
                }
            } else if (parseStatus === parseTemplateMenuStatuMap.FIND_MENU_ITEM_CONTENT) {
                if (meaning) {
                    item.srcStr += currentChar;
                    meaning = false;
                } else {
                    if (currentChar === "\\") {
                        meaning = true;
                    } else {
                        if (currentChar === sptor2) {

                            // 发现菜单配置内容闭合符。立即解析此条目使用的菜单类型。
                            item = parseTemplateMenuItem(item.srcStr);

                            menu.push(item);
                            parseStatus = parseTemplateMenuStatuMap.FIND_MENU_ITEM;
                        } else {
                            item.srcStr += currentChar;
                        }
                    }
                }
            }
            currentIndex += 1;
        }

        return menus;
    }

    /**
     * 从菜单中寻找固定到头部的菜单。
     * @param menus
     */
    function findFixHeadInMenu(menus) {
        if (menus && menus.length > 0) {

            var findCount = 0;
            var result =[];

            for (var i = 0; i < menus.length; i++) {
                var menu = menus[i];
                for (var j = 0; j < menu.length; j++) {
                    if (menu[j].header && menu[j].fixed) {
                        findCount ++;
                        result.push(menu[j]);
                        menu.splice(j, 1);
                        j--;
                    }
                }
            }

            if (findCount > 0) {
                return result;
            }
        }

        return null;
    }

    // 允许通过为 window 设置 MICROANSWER_DROPDOWAN 变量来改变本组件的注册名。
    // 以避免将来 layui 官方加入下拉控件与本控件重名时，可让本控件依然能正常运行
    // 在另一个名称上。
    var MOD_NAME = window.MICROANSWER_DROPDOWAN || "dropdown";

    // 小箭头模板
    var MENUS_POINTER_TEMPLATE =
        "{{# if (d.arrow){ }}" +
            "<div class='layu-dropdown-pointer'></div>" +
        "{{# } }}";

    var MENUS_TEMPLATE_START = "" +
        "<div tabindex='0' " +
            "class='layui-anim layui-anim-upbit layu-dropdown-root' " + MOD_NAME + "-id='{{d.downid}}' " +
            "style='display: none;z-index: {{d.zIndex}}'" +
        ">" +
            MENUS_POINTER_TEMPLATE +
            "<div class='layu-dropdown-content' " +
                "style='" +
                    "margin: {{d.gap}}px {{d.gap}}px;" +
                    "background-color: {{d.backgroundColor}};" +
                    "min-width: {{d.minWidth}}px;" +
                    "max-width: {{d.maxWidth}}px;" +
                    "min-height: {{d.minHeight}}px;" +
                    "max-height: {{d.maxHeight}}px;" +
                    "white-space: {{d.nowrap?\"nowrap\":\"normal\"}}" + /*nowrap只有在显示菜单的时候不准换行，自定义下拉是可以换行的。*/
            "'>";
                var MENUS_TEMPLATE_END = "" +
            "</div>" +
        "</div>";


    // 菜单项目模板。
    var MENUS_TEMPLATE = MENUS_TEMPLATE_START +
        "<div class='layu-dropdown-content-table' cellpadding='0' cellspacing='0'>" +
            "{{# if (d.fixHeaders && d.fixHeaders.length > 0){ }}" +
                "<div class='layu-dropdown-content-thead'>" +
                    "<div class='layu-dropdown-content-tr'>" +
                        "{{# layui.each(d.fixHeaders, function(i, fixHeader){ }}" +
                            "{{# if (fixHeader) { }}" +
                                "<div class='layu-dropdown-content-th'>" +
                                    "<div class='layu-dropdown-menu-fixed-head {{(d.menuSplitor && i < (d.menus.length-1))?\"layu-menu-splitor\":\"\"}}'>" +
                                        "<div class='layu-menu-fixed-head' style='" +
                                            "text-align: {{fixHeader.align||\"center\"}}" +
                                        "'>{{fixHeader.header}}</div>" +
                                    "</div>" +
                                "</div>" +
                            "{{# } else { }}" +
                                "<th>" +
                                    "<div class='layu-dropdown-menu-fixed-head {{(d.menuSplitor && i < (d.menus.length-1))?\"layu-menu-splitor\":\"\"}}'>" +
                                        "<div class='layu-menu-fixed-head'>&nbsp;</div>" +
                                    "</div>" +
                                "</th>" +
                            "{{# } }}" +
                        "{{# }); }}" +
                    "</div>" +
                "</div>" +
            "{{# } }}" +
            "<div class='layu-dropdown-content-tbody'>" +
                "<div class='layu-dropdown-content-tr'>" +
                    "{{# layui.each(d.menus, function(i, menu){ }}" +
                        "<div class='layu-dropdown-content-td' valign='top'>" +
                            "<div class='layu-dropdown-menu-wrap {{(d.menuSplitor && i < (d.menus.length-1))?\"layu-menu-splitor\":\"\"}} layu-overflowauto' style='" +
                                "min-height: {{d.minHeight}}px;" +
                                "max-height: {{d.maxHeight - ((d.fixHeaders)?24:0)}}px;" +
                            "'>" +
                                "<ul class='layu-dropdown-menu' dropdown-menu-index='{{i}}' style=''>" +
                                    "{{# layui.each(menu, function(index, item){ }}" +
                                        "<li class='layu-menu-item-wrap {{(d.fixHeaders && d.fixHeaders.length) > 0?\"layu-nomargin\":\"\"}}'>" +
                                            "{{# if ('hr' === item) { }}" +
                                                "<hr>" +
                                            "{{# } else if (item.header) { }}" +
                                                "{{# if (item.withLine) { }}" +
                                                    "<fieldset class=\"layui-elem-field layui-field-title layu-menu-header layu-withLine\">" +
                                                        "<legend>{{item.header}}</legend>" +
                                                    "</fieldset>" +
                                                "{{# } else { }}" +
                                                    "<div class='layu-menu-header' style='text-align: {{item.align||\"left\"}}'>{{item.header}}</div>" +
                                                "{{# } }}" +
                                            "{{# } else { }}" +
                                                "<div class='layu-menu-item' dropdown-menu-item-index='{{index}}'>" +
                                                    "<a href='javascript:;' lay-event='{{item.event}}'>" +
                                                        "{{# if (item.layIcon){ }}" +
                                                            "<i class='layui-icon {{item.layIcon}}'></i>&nbsp;" +
                                                        "{{# } }}" +
                                                        "<span class='{{item.txtClass||\"\"}}'>{{item.txt}}</span>" +
                                                    "</a>" +
                                                "</div>" +
                                            "{{# } }}" +
                                        "</li>" +
                                    "{{# }); }}" +
                                "</ul>" +
                            "</div>" +
                        "</div>" +
                    "{{#});}}" +
                "</div>" +
            "</div>" +
        "</div>" +
        MENUS_TEMPLATE_END;


    // 默认配置。
    var DEFAULT_OPTION = {

        // 要显示的下拉菜单
        menus: undefined,

        // 菜单模板，使用规定语法的模板。支持 laytpl 动态渲染。
        templateMenu: "",

        // 菜单模板配置，有时候你可能不想另外写一个 节点在界面上，此时你可以直接把菜单的配置写在这个参数里。
        templateMenuStr: "",

        // 要显示的下拉模板， 这个和上面的menus只能传递其中一个，如果同时传递了2个，以menus为准。
        template: "",

        // 打开下拉框的触发方式
        // 可填: click, hover
        showBy: 'click',

        // 左对齐。可选值: left, center, right
        align: "left",

        // 最小宽度
        minWidth: 76,

        // 最大宽度
        maxWidth: 500,

        minHeight: 10,

        // 最大高度
        maxHeight: 400,

        zIndex: 891,

        // 下拉框和触发按钮的间隙
        gap: 8,

        // 隐藏事件
        onHide: function ($dom, $down) {},

        // 显示事件
        onShow: function ($dom, $down) {},

        // 条目点击事件。
        onItemClick: function (event, menu) {},

        // 滚动界面的时候，如果下拉框是显示的，则将隐藏，如果值为 follow 则不会隐藏。
        scrollBehavior: "follow",

        // 下拉内容背景颜色
        backgroundColor: "#FFF",

        // 默认css地址，允许通过配置指定其它地址
        cssLink: "https://cdn.jsdelivr.net/gh/microanswer/layui_dropdown@${version}/dist/dropdown.css",

        // 初始化完成后是否立即显示下拉框。
        immed: false,

        // 是否显示小箭头
        arrow: true,

        // 模板菜单里使用的分隔符。
        templateMenuSptor: "[]",

        // 配置是否显示多列菜单的分割线。
        menuSplitor: true,

        // 将下拉菜单dom内容初始化到此字段指定的位置。允许填：next(默认),before,selector_xxx,
        appendTo: "next"
    };

    /**
     * 下拉菜单本体定义类。
     *
     * @Param $dom 可以是这些内容: jquery对象、选择器。
     */
    function Dropdown($dom) {
        /*
        * 在实现逻辑中使用了一些字段挂载在 Dropdown 上，这里统一做一个介绍：
        * this.$dom:   表示触发器的jquery对象。
        * this.$down:  表示下拉框下拉部分的jquery对象。以前，这是在init后就一直使用它了，现在不了，现在将在每次触发下拉的时候
        * this.downHtml: 表示下拉框的html内容，它就是在每次触发下拉的时候要显示的内容，但你要知道，dom是dom，字符串是字符串，由字符串生成的不同的dom，并不是同一个dom对象。
        * this.option: 表示选项配置。
        * this.opened: 表示下拉框是否展开。
        * this.fcd:    表示当前是否处于有焦点状态。
        * this.mic:    表示鼠标是否在组件范围内， 鼠标在 触发器+下拉框 里即算是在组件范围内。mic = mouseInComponent
        * this.initEvented: 表示是否进行过实例事件初始化。这个 下拉框里内容的初始化不同，这个初始化在整个实例只能初始化一次。 下拉框内容里的事件因为可以多次init而可以多次初始化。
        * this.systemListeners: 下拉框的正常运行离不开有些事件的监听，有很多事件是针对触发按钮设置的，又有很多事件是针对下拉框设置的，此对象内将保存那些对触发按钮设置的事件函数，这样在销毁实例时可以方便的获取到这些函数从而取消对响应事件的监听。
        * */

        if (typeof $dom === "string") {$dom = $($dom);}
        this.$dom = $dom;
        this.systemListeners = {};
    }

    Dropdown.prototype.onMenuLaytplEnd = function(html) {
        var _this = this;
        _this.downHtml = html;
        _this.initEvent();

        // 如果配置了立即显示，这里进行显示。
        if (_this.option.immed && _this.downHtml) {
            _this.show();
        }
    };

    /**
     * 初始化下拉菜单。
     * @param option
     * @returns {void}
     */
    Dropdown.prototype.init = function (option) {
        var _this    = this;
        _this.fcd    = false;
        _this.mic    = false;
        _this.opened = false;


        // 已经有option，说明这时之前init过一次，这时又一次init了。
        if (_this.option) {
            _this.option = $.extend(_this.option, option||{});
        } else {
            _this.option = $.extend({
                downid: String(Math.random()).split('.')[1],
                filter: _this.$dom.attr("lay-filter")
            }, DEFAULT_OPTION, option);
        }
        if (_this.option.gap > 20) {
            _this.option.gap = 20;
        }

        if (_this.$down) { // 已经有$down,说明之前init过，这时又一次进行init了，将之前的下拉内容清掉。
            _this.$down.remove();
            _this.$down = undefined;
        }


        if (_this.option.menus) {
            // ie8， 如果遇到空元素，移除。
            removeEmptyItem(_this.option.menus);

            if (_this.option.menus.length > 0) {

                // 判断菜单是单列还是多列
                var menu = _this.option.menus[0];

                if (!Array.isArray(menu)) { // 并不是多列。处理为多列。
                    _this.option.menus = [_this.option.menus];
                }

                for (var i = 0; i < _this.option.menus.length; i++) {
                    removeEmptyItem(_this.option.menus[i]);
                }
                _this.option.fixHeaders = findFixHeadInMenu(_this.option.menus);
                _this.option.nowrap = true;
                laytpl(MENUS_TEMPLATE).render(_this.option, function (html) {
                    _this.onMenuLaytplEnd(html);
                });
            }
        }
        else if(_this.option.templateMenu || _this.option.templateMenuStr) {
            var templateMenuStr;
            if (_this.option.templateMenu) {
                var templateMenu;
                if (_this.option.templateMenu.indexOf("#") === -1) {
                    templateMenu = "#" + _this.option.templateMenu;
                } else {
                    templateMenu = _this.option.templateMenu;
                }
                templateMenuStr = $(templateMenu).html();
                // console.log("菜单模板", _this.option.templateMenu, templateMenuStr,$(templateMenu)[0].innerText);
            } else if (_this.option.templateMenuStr) {
                templateMenuStr = _this.option.templateMenuStr;
            }

            var data = $.extend($.extend({}, _this.option), _this.option.data || {});

            laytpl(templateMenuStr).render(data, function (str) {
                _this.option.menus = parseTemplateMenu(str, _this.option.templateMenuSptor);
                _this.option.fixHeaders = findFixHeadInMenu(_this.option.menus);
                _this.option.nowrap = true;
                laytpl(MENUS_TEMPLATE).render(_this.option, function (html) {
                    _this.onMenuLaytplEnd(html);
                });
            });

        }
        else if (_this.option.template) {
            var templateId;
            if (_this.option.template.indexOf("#") === -1) {
                templateId = "#" + _this.option.template;
            } else {
                templateId = _this.option.template;
            }

            var data = $.extend($.extend({}, _this.option), _this.option.data || {});
            data.nowrap = false;
            laytpl(MENUS_TEMPLATE_START + $(templateId).html() + MENUS_TEMPLATE_END).render(data, function (html) {
                _this.onMenuLaytplEnd(html);
            });

        }
        else {
            layui.hint().error("下拉框目前即没配置菜单项，也没配置下拉模板。[#" + (_this.$dom.attr("id") || "") + ",filter=" + _this.option.filter + "]");
        }
    };

    Dropdown.prototype.initSize = function () {
        if (!this.$down) return;
        this.$down.find(".layu-dropdown-pointer").css({
            "width": this.option.gap * 2,
            "height": this.option.gap * 2
        });

        if (!this._sized) {
            var height = 0;
            this.$down.find(".dropdown-menu-wrap").each(function () {
                height = Math.max(height, $(this).height());
            });
            this.$down.find(".dropdown-menu-wrap").css({
                "height": height
            });
            this._sized = true;
        }
    };

    // 初始化位置信息
    Dropdown.prototype.initPosition = function () {
        if (!this.$down) {return;}

        var pageYOffset = typeof window.pageYOffset === 'number' ? window.pageYOffset : document.documentElement.scrollTop;

        var btnOffset  = this.$dom.offset();
        var btnHeight  = this.$dom.outerHeight();
        var btnWidth   = this.$dom.outerWidth();
        var btnLeft    = btnOffset.left;
        var btnTop     = btnOffset.top - pageYOffset;
        var downHeight = this.$down.outerHeight();
        var downWidth  = this.$down.outerWidth();

        var downLeft;
        var downTop;
        var pointerLeft;  // 箭头左边偏移量
        var pointerTop; // 箭头上边偏移量
        if (this.option.align === 'right') {
            downLeft = (btnLeft + btnWidth) - downWidth + this.option.gap;
        } else if (this.option.align === 'center') {
            downLeft = btnLeft + ((btnWidth - downWidth) / 2);
        } else {
            downLeft = btnLeft - this.option.gap;
        }
        downTop = btnHeight + btnTop; // + this.option.gap;

        // 检测是否超出浏览器边缘 downLeft 是一个不包含 gap 的结果。所以这里要算上一个gap。
        if (downLeft + downWidth >= window.innerWidth) {
            downLeft = window.innerWidth - downWidth - (this.option.gap * 2);
        }

        // 计算箭头左侧坐标。
        if (btnLeft > downLeft) {
            if (downWidth > btnWidth) {
                pointerLeft = btnLeft - downLeft + (btnWidth / 2);
            } else {
                pointerLeft = downWidth / 2;
            }
        } else /*downLeft >= btnLeft*/{
            if (downWidth > btnWidth) {
                pointerLeft = downLeft + ((btnLeft + btnWidth - downLeft) / 2);
            } else {
                pointerLeft = downWidth / 2;
            }
        }
        pointerLeft -= this.option.gap;


        var pt = this.$arrowDom;
        // var pointerHeigt = Math.pow(this.option.gap, 2) / Math.sqrt(Math.pow(this.option.gap, 2)*2);
        pointerTop = -this.option.gap;

        pt.css("left", pointerLeft);
        pt.css("right", "unset");

        if (downTop + downHeight >= window.innerHeight) {
            downTop = btnTop - downHeight;// - this.option.gap;
            pointerTop = downHeight - (this.option.gap); //(pointerHeigt * 2) - 1;

            pt.css("top", pointerTop).addClass("bottom");
        } else {
            pt.css("top", pointerTop).removeClass("bottom");
        }


        this.$down.css("left", downLeft);
        this.$down.css("top", downTop);
    };

    // 到了需要把下拉内容渲染到界面上的时候
    // 本方法会被执行。
    Dropdown.prototype.renderDownHtml = function() {

        // 创建下拉dom
        this.$down = $(this.downHtml);

        var appendTo = this.option.appendTo;
        if (appendTo === "next") {
            this.$dom.after(this.$down);
        } else if (appendTo === "before") {
            this.$dom.before(this.$down);
        } else if (appendTo.indexOf("selector_") === 0) {
            var $target = $(appendTo.substr(appendTo.indexOf("_") + 1));
            $target.append(this.$down);
        } else {
            throw new Error("不支持此渲染方式。请填写：next, before, selector_xxx 某一项内容。");
        }
    };

    // 显示下拉内容
    Dropdown.prototype.show = function () {
        var _this = this;

        // 标记是否执行了添加下拉dom的操作。
        var isDidDomAdd = false;

        if (!_this.$down) {
            // 加入界面。
            _this.renderDownHtml();
            _this.$arrowDom = _this.$down.find(".layu-dropdown-pointer");

            isDidDomAdd = true;
        }
        _this.initPosition();

        _this.opening = true; // 引入这个字段用于确保在动画过程中鼠标移出组件区域时不会隐藏下拉框。
        // 使用settimeout原因:
        // 如果 这个show方法在某个点击事件里面调用，那么立即调用focus方法的话是不会生效的。
        // 为了稳妥起见，延时100毫秒，再使下拉框获取焦点。从而在其失去焦点时能够自动隐藏。
        setTimeout(function () {
            _this.$down.focus();
        }, 100);

        _this.$down.addClass("layui-show");
        _this.initSize();
        _this.opened = true;

        if (isDidDomAdd) {
            // 事件处理
            _this.initDropdownEvent();
        }

        // 发出通知，告诉其他dropdown，我打开了，你们自己看情况办事!
        makeEvent(EVENT.DROPDOWN_SHOW, _this);

        if (isDidDomAdd) {
            // 由于现在是每次触发时再生成dom，生成的新的dom可能存在其它需要初始化的，这里调起success使这些初始化得以执行。
            _this.onSuccess();
        }

        // 调起回调。
        _this.option.onShow && _this.option.onShow(_this.$dom, _this.$down);
    };

    // 隐藏下拉内容
    Dropdown.prototype.hide = function () {
        if (!this.opened) {
            return; // 如果本来我就没有显示，那我就不用处理任何事情了。
        }
        this.fcd = false;
        this.$down.removeClass("layui-show");
        this.opened = false;

        this.option.onHide && this.option.onHide(this.$dom, this.$down);
    };

    // 当可以条件允许隐藏时，进行隐藏。
    // 条件：鼠标在下拉框范围外、下拉框和触发按钮都没有焦点
    Dropdown.prototype.hideWhenCan = function () {
        if (this.mic) {
            return;
        }
        if (this.opening) {
            return;
        }
        if (this.fcd) {
            return;
        }
        this.hide();
    };

    // 显示/隐藏下拉内容
    Dropdown.prototype.toggle = function () {
        if (this.opened) {
            this.hide();
        } else {
            this.show();
        }
    };

    Dropdown.prototype.onSuccess = function () {

        // 调起回调。
        this.option.success && this.option.success(this.$down);
    };


    // 滚动界面时此方法会执行
    Dropdown.prototype._onScroll = function () {
        var _this = this;

        // 如果下拉框不是展开状态，不用执行这些逻辑。
        // OHHHHHH! md才发现，当界面上出现很多下拉框(很少情况)，这个判断真的极大提高了性能，避免了无用的执行。
        // 。使页面滚动不卡顿了，尤其是在ie里。
        if (!_this.opened) {
            return;
        }

        if (this.option.scrollBehavior === 'follow') {
            setTimeout(function () {
                _this.initPosition();
            }, 10);
        } else {
            this.hide();
        }
    };

    // 界面大小变化时，此方法会执行。
    Dropdown.prototype._onResize = function () {
        if (!this.opened) {
            return;
        }
        this.initPosition();
    };

    // 初始化事件。
    Dropdown.prototype.initEvent = function () {
        var _this = this;
        if (_this.initEvented) {return}
        _this.initEvented = true;

        // 全局仅允许同时开启一个下拉菜单。所以这里注册一个监听。
        // 如果打开的下拉菜单不是我本身，则我应该隐藏自己。
        onEvent(EVENT.DROPDOWN_SHOW, function (dropdown) {
            if (dropdown !== _this) {
                _this.hide();
            }
        });

        this.systemListeners.scrollListener = _this._onScroll.bind(_this);
        this.systemListeners.resizeListener = _this._onResize.bind(_this);

        $(window).on("scroll", this.systemListeners.scrollListener);
        _this.$dom.parents().on("scroll", this.systemListeners.scrollListener);
        $(window).on("resize", this.systemListeners.resizeListener);

        _this.initDomEvent();
    };

    // 初始化触发器的事件，比如点击、hover，使能 按钮对应事件能够唤起下拉框。
    Dropdown.prototype.initDomEvent = function () {
        var _this = this;
        _this.$dom.mouseenter(function () {
            _this.mic = true;
            if (_this.option.showBy === 'hover') {
                _this.fcd = true;
                // _this.$down.focus();
                _this.show();
            }
        });
        _this.$dom.mouseleave(function () {
            _this.mic = false;
        });


        if (_this.option.showBy === 'click') {
            _this.$dom.on("click", function () {
                _this.fcd = true;
                _this.toggle();
            });
        }

        _this.$dom.on("blur", function () {
            _this.fcd = false;
            _this.hideWhenCan();
        });
    };

    // 初始化下拉框下拉后的事件， 比如说鼠标移动到下拉框外面、点击外部等事件。
    Dropdown.prototype.initDropdownEvent = function () {
        var _this = this;

        // 这段是启用内部滚动实现，以免在菜单内滚动时，会影响外部界面的滚动，但是这宾不能管理到笔记本触摸板上的滚动。
        _this.$down.find(".layu-dropdown-menu-wrap").on("mousewheel", function (e) {
            var $this = $(this);
            e = e || window.event;
            e.cancelable = true;
            e.cancelBubble = true;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation && e.stopImmediatePropagation();
            e.returnValue = false;

            if (_this.scrolling) {
                $this.finish(); // 立即完成没有完成的动画。
            }

            // firefox使用detail:下3上-3,其他浏览器使用wheelDelta:下-120上120
            var delta = -e.originalEvent.wheelDelta || e.originalEvent.detail;
            if(delta > 0) { // 下滚
                if (delta > 50) {delta = 50;}
                _this.scrolling = true;
                $this.animate({
                    scrollTop: $this.scrollTop() + delta
                }, {
                    duration : 170,
                    complete: function () {
                        _this.scrolling = false;
                    }
                });
            } else if(delta < 0) { // 上滚
                if (delta < -50) {delta = -50;}
                _this.scrolling = true;
                $this.animate({
                    scrollTop: $this.scrollTop() + delta
                }, {
                    duration : 170,
                    complete: function () {
                        _this.scrolling = false;
                    }
                });
            } else /* delta === 0 */{
                _this.scrolling = false;
            }
        });

        _this.$down.mouseenter(function () {
            _this.mic = true;
            _this.$down.focus();
        });
        _this.$down.mouseleave(function () {
            _this.mic = false;
        });

        _this.$down.on("blur", function () {
            _this.fcd = false;
            _this.hideWhenCan();
        });

        // 当下拉框获取焦点时，必然下拉框显示了，这时 吧 opening 设置false
        _this.$down.on("focus", function () {
            _this.opening = false;
        });

        // 点击下拉菜单里的条目事件
        if (_this.option.menus) {
            var $md = $("[" + MOD_NAME + "-id='" + _this.option.downid + "']");

            $md.on("click", "a", function () {
                var $this = $(this);
                var event = ($this.attr('lay-event') || '').trim();
                if (event) {
                    // layui.event.call(this, MOD_NAME, MOD_NAME + '(' + _this.option.filter + ')', event);
                    var mEvent = MOD_NAME + "(" + _this.option.filter + ")" + "." + EVENT.DROPDOWN_ITEM_CLICK;
                    var $menuIndex = $this.parents("[dropdown-menu-index]");
                    var $menuItemIndex = $this.parents("[dropdown-menu-item-index]");
                    var menu = _this.option.menus
                        [parseInt($menuIndex.attr("dropdown-menu-index"))]
                        [parseInt($menuItemIndex.attr("dropdown-menu-item-index"))];

                    if (_this.option.onItemClick){
                        _this.option.onItemClick(event, menu);
                    }

                    makeEvent(mEvent, {
                        event: event,
                        data: menu
                    });
                    _this.hide();
                } else {
                    layui.hint().error("菜单条目[" + this.outerHTML + "]未设置event。");
                }
            });
        }
    };

    // 销毁该下拉框实例。
    Dropdown.prototype.destroy = function (keepListener) {

        this.fcd = false;
        this.downHtml = undefined;
        this.mic = false;
        this.opened = false;


        $(window).off("scroll", this.systemListeners.scrollListener);
        this.$dom.parents().off("scroll", this.systemListeners.scrollListener);
        $(window).off("resize", this.systemListeners.resizeListener);
        if (this.$down) {
            this.$down.remove();
        }

        this.$dom.removeData(MOD_NAME, null);

        if (typeof keepListener === "undefined") keepListener = true;
        if (!keepListener) {
            var event = MOD_NAME + "(" + this.option.filter + ")" + "." + EVENT.DROPDOWN_ITEM_CLICK;
            delete INNER_EVENT[event];
        }

    };

    // 监听事件方法
    function onFilter(layFitler, cb) {
        var event = MOD_NAME + "(" + layFitler + ")" + "." + EVENT.DROPDOWN_ITEM_CLICK;
        onEvent(event, function (param) {
            cb && cb(param.event, param.data);
        });

        // layui.onevent(MOD_NAME, , function (event) {
        //     cb && cb(event);
        // });
    }

    // 全局初始化方法。
    function suite(sector, option) {
        // 初始化页面上已有的下拉控件。
        $(sector || "[lay-" + MOD_NAME + "]").each(function () {
            var $this = $(this);
            var attrOption = new Function('return ' + ($this.attr("lay-" + MOD_NAME) || "{}"))();
            $this.removeAttr("lay-" + MOD_NAME); // 移除节点上的这个标签，因为它很长，不利于调试。
            var opt = $.extend({}, attrOption, option || {});
            var dp = $this.data(MOD_NAME) || new Dropdown($this);
            $this.data(MOD_NAME, dp);
            dp.init(opt);
        });
    }

    // 执行一次，立马让界面上的dropdown乖乖听话。
    suite();

    // 加载css，使外部不需要手动引入css。允许通过设置 window.dropdown_cssLink 来修改默认css地址。
    (!window[MOD_NAME+"_useOwnCss"]) && layui.link(window[MOD_NAME+"_cssLink"] || DEFAULT_OPTION.cssLink, function () {/*ignore*/}, MOD_NAME + "_css");

    exports(MOD_NAME, {

        /**
         * 方便手动对界面上的按钮进行初始化
         */
        suite: suite,

        /**
         * 监听menu菜单点击事件
         */
        onFilter: onFilter,

        /**
         * 传入选择器，将其对应的下拉框隐藏。
         * 这个方法常常用代码调用。它不被设计为某个按钮点击后执行这个方法。
         * 因为下拉框的隐藏会在失去focus时自动隐藏，无论点击哪个按钮都会使
         * 下拉框失去focus而隐藏，此方法调用也没意义了。
         * @param {String} sector
         */
        hide: function (sector) {
            // 隐藏指定下拉框。
            $(sector).each(function () {
                var $this = $(this);
                var dp = $this.data(MOD_NAME);
                if (dp) {
                    dp.hide();
                }
            });
        },

        /**
         * 传入选择器，将其对应的下拉框显示。
         *
         * 注意:如果选择器对应的dom没有进行下拉初始化，则此方法会进行初始化。此时会用到参数option，你可以
         * 通过第二个参数传入。但是通常建议传入的选择器对应的dom是经过了下拉框初始化的。
         * @param sector
         * @param option
         */
        show: function (sector, option) {
            // 显示指定下拉框。
            $(sector).each(function () {
                var $this = $(this);
                var dp = $this.data(MOD_NAME);
                if (dp) {
                    dp.show();
                } else {
                    layui.hint().error("警告：尝试在选择器【" + sector + "】上进行下拉框show操作，但此选择器对应的dom并没有初始化下拉框。");
                    // 尝试在一个没有初始化下拉框的dom上调用show方法，这里立即进行初始化。
                    option = option || {};

                    // 立即显示。
                    option.immed = true;
                    suite(sector, option);
                }
            });
        },


        /**
         * 传入选择器，将其对应的下拉框实例进行销毁。
         * @param {String} sector
         */
        destroy: function (sector, keepListener) {
            // 隐藏指定下拉框。
            $(sector).each(function () {
                var $this = $(this);
                var dp = $this.data(MOD_NAME);
                if (dp) {
                    dp.destroy(keepListener);
                }
            });
        },

        version: version
    });
});
