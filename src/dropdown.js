/**
 * @Name layui 下拉控件。
 * @Author: Microanswer
 * @License: ISC
 */
layui.define(['jquery', 'laytpl'], function (exports){
    "use strict";


    var $         = layui.jquery || layui.$,
        laytpl    = layui.laytpl,
        $body     = $(window.document.body),

        // 允许通过为 window 设置 MICROANSWER_DROPDOWAN 变量来改变本组件的注册名。
        // 以避免将来 layui 官方加入下拉控件与本控件重名时，可让本控件依然能正常运行
        // 在另一个名称上。
        MOD_NAME = window.MICROANSWER_DROPDOWAN || "dropdown",

        MENUS_TEMPLATE_START = "<div tabindex='0' " +
            "class='layui-anim layui-anim-upbit dropdown-root' " + MOD_NAME + "-id='{{d.downid}}' " +
            "style='min-width: {{d.minWidth}}px;" +
            "min-height: {{d.minHeight}}px;" +
            "max-height: {{d.maxHeight}}px;" +
            "overflow: auto;" +
            "z-index: {{d.zIndex}}'>",
        MENUS_TEMPLATE_END = "</div>",

        // 菜单项目模板。
        MENUS_TEMPLATE = MENUS_TEMPLATE_START+
                "{{# layui.each(d.menus, function(index, item){ }}" +
                    "<div class='menu-item'>" +
                        "<a href='javascript:;' lay-event='{{item.event}}'>" +
                            "{{# if (item.layIcon){ }}" +
                                "<i class='layui-icon {{item.layIcon}}'></i>&nbsp;" +
                            "{{# } }}" +
                            "<span>{{item.txt}}</span>" +
                        "</a>" +
                    "</div>" +
                "{{# }); }}" + MENUS_TEMPLATE_END,


        // 默认配置。
        DEFAULT_OPTION = {

            // 打开下拉框的触发方式
            // 可填: click, hover
            showBy: 'click',

            // 左对齐。可选值: left, center, right
            align: "left",

            // 最小宽度
            minWidth: 10,

            minHeight: 10,

            // 最大高度
            maxHeight: 300,

            zIndex: 102,

            // 下拉框和触发按钮的间隙
            gap: 4
        },

        /**
         * 下拉菜单本体定义类。
         *
         * @Param $dom 可以是这些内容: jquery对象、选择器。
         */
        Dropdown = function($dom, option) {
            if (typeof $dom === "string") {$dom = $($dom);}
            this.$dom = $dom;
            this.option = $.extend({
                downid: String(Math.random()).split('.')[1],
                filter: $dom.attr("lay-filter")
            }, DEFAULT_OPTION, option);

            this.init();
        };

        // 初始化下拉菜单。
        Dropdown.prototype.init = function () {
            var _this = this;

            if (_this.option.menus) {
                laytpl(MENUS_TEMPLATE).render(_this.option, function (html) {
                    _this.$down = $(html);
                    _this.$dom.after(_this.$down);

                    _this.initEvent();
                });
            } else if (_this.option.template) {
                var templateId;
                if (_this.option.template.indexOf("#") === -1) {
                    templateId = "#" + _this.option.template;
                } else {
                    templateId = _this.option.template;
                }

                var data = $.extend({
                    downid: _this.option.downid,
                    minWidth: _this.option.minWidth,
                    minHeight: _this.option.minHeight,
                    maxHeight: _this.option.maxHeight,
                    zIndex: _this.option.zIndex
                }, _this.option.data || {});
                laytpl(MENUS_TEMPLATE_START + $(templateId).html() + MENUS_TEMPLATE_END).render(data, function (html) {
                    _this.$down = $(html);
                    _this.$dom.after(_this.$down);

                    _this.option.success && _this.option.success(_this.$down);

                    _this.initEvent();
                });


            } else {
                layui.hint().error("下拉框目前即没配置菜单项，也没配置下拉模板。");
            }
        };

        // 初始化位置信息
        Dropdown.prototype.initPosition = function() {
            var btnOffset = this.$dom.offset();
            var btnHeight = this.$dom.outerHeight();
            var btnWidth  = this.$dom.outerWidth();
            var btnLeft = btnOffset.left;
            var btnTop  = btnOffset.top - window.scrollY;

            var downHeight = this.$down.outerHeight();
            var downWidth = this.$down.outerWidth();

            var downLeft;
            var downTop;
            if (this.option.align === 'right') {
                downLeft = (btnLeft + btnWidth) - downWidth;
            } else if (this.option.align === 'center') {
                downLeft = btnLeft + ((btnWidth - downWidth) / 2);
            } else {
                downLeft = btnLeft;
            }
            downTop = btnHeight + btnTop + this.option.gap;

            // 检测是否超出浏览器边缘
            if (downTop + downHeight >= window.innerHeight) {
                downTop = btnTop - downHeight - this.option.gap;
            }
            if (downLeft + downWidth >= window.innerWidth) {
                downLeft = window.innerWidth - downWidth - this.option.gap;
            }

            this.$down.css("left", downLeft);
            this.$down.css("top", downTop);
        };

        // 显示下拉内容
        Dropdown.prototype.show = function () {
            this.initPosition();

            this.$down.addClass("layui-show");
            this.opened = true;
        };

        // 隐藏下拉内容
        Dropdown.prototype.hide = function () {
            this.fcd = false;
            this.$down.removeClass("layui-show");
            this.opened = false;
        };

        // 当可以条件允许隐藏时，进行隐藏。
        // 条件：鼠标在下拉框范围外、下拉框和触发按钮都没有焦点
        Dropdown.prototype.hideWhenCan = function () {
            if (this.mouseInCompoent) {
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

        // 初始化事件。
        Dropdown.prototype.initEvent = function () {
            var _this = this;

            if (_this.option.showBy === 'click') {
                _this.$dom.on("click", function () {
                    _this.fcd = true;
                    _this.toggle();
                });
            }

            _this.$down.on("click", function () {
                _this.fcd = true;
                _this.$down.focus();
            });

            $body.on("click", function () {
                if (!_this.mouseInCompoent) {
                    _this.fcd = false;
                }
                _this.hideWhenCan();
            });

            $(window).on("scroll", function () {
                _this.initPosition();
            });

            $(window).on("resize", function () {
                _this.initPosition();
            });

            $(window).on("mousemove", function (event) {
                var x = event.pageX;
                var y = event.pageY;

                var ofst = _this.$dom.offset();

                _this.mouseInCompoent =
                    (x >= ofst.left && x <= ofst.left + _this.$dom.width()) &&
                    (y >= ofst.top && y <= ofst.top + _this.$dom.height());


                var ofst2;
                if (_this.$down && _this.opened) {
                    ofst2 = _this.$down.offset();

                    _this.mouseInCompoent = _this.mouseInCompoent ||
                        (x >= ofst2.left && x <= ofst2.left + _this.$down.width()) &&
                        (y >= ofst2.top && y <= ofst2.top + _this.$down.height());

                }

                if (_this.mouseInCompoent) {
                    if (_this.option.showBy === 'hover') {
                        _this.fcd = true;
                        _this.$down.focus();
                        _this.show();
                    }
                } else {
                    if (_this.option.showBy === 'hover') {
                        _this.hideWhenCan();
                    }
                }
            });

            _this.$dom.on("blur", function () {
                _this.fcd = false;
                _this.hideWhenCan();
            });
            _this.$down.on("blur", function () {
                _this.fcd = false;
                _this.hideWhenCan();
            });

            // 点击下拉菜单里的条目事件
            if (_this.option.menus) {
                var $md = $("[" + MOD_NAME + "-id='" + _this.option.downid + "']");

                $md.on("click", "a", function () {
                    var event = $(this).attr('lay-event');
                    if (event) {
                        layui.event.call(this, MOD_NAME, MOD_NAME + '(' + _this.option.filter + ')', event);
                        _this.hide();
                    } else {
                        layui.hint().error("菜单条目[" + this.outerHTML + "]未设置event。");
                    }
                });
            }
        };

        // 监听事件方法
        function onFilter(layFitler, cb) {
            layui.onevent(MOD_NAME, MOD_NAME + "(" + layFitler + ")", function (event) {
                cb && cb(event);
            });
        }

        // 全局初始化方法。
        function suite(sector, option) {
            // 初始化页面上已有的下拉控件。
            $(sector || "[lay-"+ MOD_NAME +"]").each(function () {
                var $this = $(this);
                var attrOption = new Function('return '+ ($this.attr("lay-" + MOD_NAME) || "{}"))();

                var dp = $this.data(MOD_NAME) || new Dropdown($this, $.extend({}, attrOption, option || {}));
                $this.data(MOD_NAME, dp);
            });
        }

        // 执行一次，立马让界面上的dropdown乖乖听话。
        suite();

    exports(MOD_NAME, {suite: suite, onFilter: onFilter});
});