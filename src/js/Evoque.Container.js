//Dependency: Evoque.js
$.container = (function (self)
{
    var defaultOption = {
        divIdList: [],
        onShow: function () {},
        onHide: function () {}
    };

    self.create = function (option)
    {
        if (isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        var divIdList = option.getValueOfProperty('divIdList', defaultOption);
        var onShowMtd = option.getValueOfProperty('onShow', defaultOption);
        var onHideMtd = option.getValueOfProperty('onHide', defaultOption);
        if (checkType(divIdList) !== type.eArray)
        {
            throw 'Parameter is error!';
        }
        return new containerClass(divIdList, onShowMtd, onHideMtd);
    };

    function containerClass(divIdList, onShow, onHide)
    {
        var onShowIsFn = checkType(onShow) === type.eFunction;
        var onHideIsFn = checkType(onHide) === type.eFunction;

        var ids = divIdList;
        var divList = [];
        for (var i = 0; i < ids.length; ++i)
        {
            var loop = $('#' + ids[i]);
            divList.push(loop);
            hide(loop);
        }

        var currentDisplayId = '';
        this.currentDisplay = null;

        this.display = function(divId, option)
        {
            var parameter = createOption();
            if (!isObjectNull(option) && checkType(option.remainHideDivInput) === type.eBoolean)
            {
                parameter.remainHideDivInput = option.remainHideDivInput;
            }

            var toShowId = divId;
            var toShowDiv = null;
            for (var i = 0; i < ids.length; ++i)
            {
                if (ids[i] == toShowId)
                {
                    toShowDiv = divList[i];
                }
                else
                {
                    if (!isStringEmpty(currentDisplayId) && ids[i] === currentDisplayId)
                    {
                        var toHideDiv = this.currentDisplay;
                        hide(toHideDiv, parameter.remainHideDivInput);
                        currentDisplayId = '';
                        this.currentDisplay = null;
                        if (toHideDiv.length > 0 && onHideIsFn)
                        {
                            onHide.call(toHideDiv[0], parameter);
                        }
                    }
                }
            }
            if (toShowDiv != null)
            {
                currentDisplayId = toShowId;
                this.currentDisplay = toShowDiv;
                show(toShowDiv);
                if (toShowDiv.length > 0 && onShowIsFn)
                {
                    onShow.call(toShowDiv[0]);
                }
            }
        };

        function createOption()
        {
            return {
                remainHideDivInput : false
            };
        }

        function show(ediv)
        {
            ediv.show();
            var select = ediv.getChild('select');
            select.enable();
            var input = ediv.getChild('input');
            input.enable();
        }

        function hide(ediv, remainHideDiv)
        {
            ediv.hide();
            if (remainHideDiv)
            {
                return;
            }
            var select = ediv.getChild('select');
            select.disable();
            var input = ediv.getChild('input');
            input.disable();
        }
    }

    return self;
}($.container || {}));
