﻿//Dependency: Evoque.js, json2.js
$.ajax = (function (self)
{
    var defaultOption = {
        // 'get'(default), 'post'
        method : 'get',
        url : '',
        // json
        parameter : {},
        // Form(Only can be used when [method] == 'post'). Its value can be id or element
        form: undefined,
        // 'text'(default), 'json', 'html'
        returnType : 'text',
        onSuccess : function (returnObj) {},
        onFail : function () {},
        // seconds
        timeOut : 30
    };

    self.get = function (option)
    {
        checkOption(option);
        option = $(option);
        var xmlhttp = new XMLHttpRequest();
        var urlTemp = option.getValueOfProperty('url', defaultOption);
        var spliter = '';
        if (urlTemp.indexOf('?') > -1)
        {
            spliter = '&';
        }
        else
        {
            spliter = '?';
        }
        var parameterGet = option.getValueOfProperty('parameter', defaultOption);
        //针对IE对ajax请求结果的缓存机制，增加时间戳参数
        parameterGet.timestamp = (new Date()).getTime();
        xmlhttp.open('get', urlTemp + spliter + serializeQuery(parameterGet), true);
        bindEvent(xmlhttp, option);
        xmlhttp.send();
        if (!xmlhttp.evoque_sptTimeout)
        {
            if ($.app() === mApp.hmbrowser)
            {
                return;
            }
            xmlhttp.timeoutId = setTimeout(function () {
                xmlhttp.abort();
                xmlhttp.ontimeout();
            }, xmlhttp.timeout);
        }
    };

    self.post = function (option)
    {
        checkOption(option);
        option = $(option);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('post', option.getValueOfProperty('url', defaultOption), true);
        bindEvent(xmlhttp, option);
        xmlhttp.setRequestHeader('x-requested-with', 'XMLHttpRequest');
        //判断浏览器是否支持FormData类
        if(window.FormData)
        {
            // 使用FormData传递post数据，无须设置Content-Type. xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            xmlhttp.send(serializeForm(option.getValueOfProperty('parameter', defaultOption), option[0].form));
        }
        else
        {
            xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            var pain = option.getValueOfProperty('parameter', defaultOption);
            var frm = option[0].form;
            for (var i = 0; i < frm.length; ++i)
            {
                if ($.isStringEmpty(frm[i].name))
                {
                    continue;
                }
                pain[frm[i].name] = frm[i].value;
            }
            xmlhttp.send(serializeQuery(pain));
        }
        if (!xmlhttp.evoque_sptTimeout)
        {
            if ($.app() === mApp.hmbrowser)
            {
                return;
            }
            xmlhttp.timeoutId = setTimeout(function () {
                xmlhttp.abort();
                xmlhttp.ontimeout();
            }, xmlhttp.timeout);
        }
    };

    function checkOption(option)
    {
        if ($.isObjectNull(option))
        {
            throw 'option is null!';
        }
        if ($.isStringEmpty(option.url))
        {
            throw 'url is empty!';
        }
    }

    function serializeQuery(parameter)
    {
        var ret = '';
        for (var p in parameter)
        {
            ret += p;
            ret += '=';
            ret += encodeURIComponent(parameter[p].toString());
            ret += '&';
        }
        if (ret.length > 0)
        {
            ret = ret.slice(0, -1);
        }
        return ret;
    }

    function serializeForm(parameter, form)
    {
        var formData;
        var typeF = $.checkType(form);
        if (typeF === type.eElement && form instanceof HTMLFormElement)
        {
            formData = new FormData(form);
        }
        else if (typeF === type.eString && !$.isStringEmpty(form))
        {
            var formEle = $('#' + form);
            if (formEle.length > 0)
            {
                formData = new FormData(formEle[0]);
            }
        }
        if ($.isObjectNull(formData))
        {
            formData = new FormData();
        }
        for (var p in parameter)
        {
            formData.append(p, parameter[p]);
        }
        return formData;
    }

    function bindEvent(xmlhttp, option)
    {
        var returnType = option.getValueOfProperty('returnType', defaultOption).toLowerCase();
        var onSuccess = option.getValueOfProperty('onSuccess', defaultOption);
        var onFail = option.getValueOfProperty('onFail', defaultOption);
        var isFailed = false;
        var timeOut = option.getValueOfProperty('timeOut', defaultOption);
        // 设置返回值类型(android平台目前不支持returnType == 'html')
        if (returnType == 'html')
        {
            xmlhttp.responseType = 'document';
        }
        // 这里Chrome和Safari都不支持把 responseType 设置成'json'
        // safari不支持timeout属性
        xmlhttp.evoque_sptTimeout = true;
        if ($.checkType(xmlhttp.timeout) === type.eUndefined)
        {
            xmlhttp.evoque_sptTimeout = false;
        }
        xmlhttp.timeout = timeOut * 1000;
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4)
            {
                if (!xmlhttp.evoque_sptTimeout)
                {
                    clearTimeout(xmlhttp.timeoutId);
                }
                if (xmlhttp.status == 200)
                {
                    var resp = null;
                    if ($.checkType(xmlhttp.response) === type.eUndefined)
                    {
                        resp = xmlhttp.responseText;
                    }
                    else
                    {
                        resp = xmlhttp.response;
                    }
                    if (returnType == 'json')
                    {
                        onSuccess(JSON.parse(resp));
                    }
                    else
                    {
                        onSuccess(resp);
                    }
                }
                else
                {
                    if (!isFailed)
                    {
                        isFailed = true;
                        onFail({ type: 'failed' });
                    }
                }
                xmlhttp = null;
            }
        };
        xmlhttp.onerror = function () {
            if (!xmlhttp.evoque_sptTimeout)
            {
                clearTimeout(xmlhttp.timeoutId);
            }
            if (!isFailed)
            {
                isFailed = true;
                onFail({ type: 'error' });
            }
            xmlhttp = null;
        };
        xmlhttp.ontimeout = function () {
            if (!isFailed)
            {
                isFailed = true;
                onFail({ type: 'timeout' });
            }
            xmlhttp = null;
        };
    }

    //API
    Evoque.post = function (option)
    {
        option = option || {};
        if (this.length < 1)
        {
            return;
        }
        var form = this[0];
        if (form instanceof HTMLFormElement)
        {
            if ($.isStringEmpty(option.url))
            {
                option.url = this.getAttr('action');
            }
            if ($.isStringEmpty(option.url))
            {
                return;
            }
            option.method = 'post';
            option.form = form;
            return $.ajax.post(option);
        }
    }

    return self;
}($.ajax || {}));