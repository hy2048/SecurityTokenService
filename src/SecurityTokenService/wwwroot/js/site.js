﻿$(document).ready(() => {
    const url = location.href;
    if (url.indexOf("login.html") >= 0) {
        initLogin();
    } else if (url.indexOf("logout.html") >= 0) {
        initLogout();
    } else if (url.indexOf("loggedout.html") >= 0) {
        initLoggedOut();
    } else if (url.indexOf("diagnostics.html") >= 0) {
        initSession();
        initDiagnostics();
    } else if (url.indexOf("consent.html") >= 0) {
        initSession();
        initConsent();
    } else if (url.indexOf("redirect.html") >= 0) {
        initRedirect();
    } else if (url.indexOf("changePassword.html") >= 0) {
        initChangePassword();
    } else if (url.indexOf("error.html") >= 0) {
        initSession();
        initError();
    } else {
        initSession();
    }
})

function initError() {
    const errorId = parseInt(getQueryParam('errorId'));
    printError(errorId);
}

function printError(errorId) {
    switch (errorId) {
        case 4001: {
            $('#message').text('不支持双因素认证')
            break;
        }
        case 4002: {
            $('#message').text('用户被禁止登录')
            break;
        }
        case 4003: {
            $('#message').text('用户被锁定')
            break;
        }
        case 4004: {
            $('#message').text('用户名或密码不正确')
            break;
        }
        case 4005: {
            $('#message').text('不支持 NativeClient')
            break;
        }
        case 4006: {
            $('#message').text('返回地址不合法')
            break;
        }
        case 4007: {
            $('#message').text('选择的操作不正确')
            break;
        }
        case 4008: {
            $('#message').text('没有 Scope 可匹配')
            break;
        }
        case 4009: {
            $('#message').text('客户端标识出错')
            break;
        }
        case 4010: {
            $('#message').text('授权请求链接不正确')
            break;
        }
        case 4011: {
            $('#message').text('登录失败')
            break;
        }
        default: {
            $('#message').text('未知错误')
        }
    }
}

function initRedirect() {
    const url = getQueryParam('redirectUrl');
    if (!url) {
        return;
    }
    window.location.href = url;
}

function initConsent() {
    const returnUrl = getQueryParam('returnUrl');
    $.ajax({
        xhrFields: {withCredentials: true},
        type: "GET",
        url: "consent?returnUrl=" + returnUrl,
        success: function (res2) {
            const res = res2.data;
            $('#clientName').prepend(res.clientName)
            if (res.clientLogoUrl) {
                $('#clientLogoUrl').attr('src', res.clientLogoUrl)
            } else {
                $('#clientLogoUrl').remove()
            }

            $('#returnUrl').val(res.returnUrl);
            if (res.identityScopes && res.identityScopes.length > 0) {
                for (let i = 0; i < res.identityScopes.length; ++i) {
                    const scope = res.identityScopes[i];
                    appendScope('identityScopeList', scope);
                }

                $('#identityScopes').show();
            }
            if (res.resourceScopes && res.resourceScopes.length > 0) {
                for (let i = 0; i < res.resourceScopes.length; ++i) {
                    const scope = res.resourceScopes[i];
                    appendScope('resourceScopes', scope);
                }
                $('#resourceScopes').show();
            }
            if (res.allowRememberConsent) {
                $('#rememberConsentDiv').show();
            } else {
                $('#rememberConsent').val(false);
            }
            if (res.clientUrl) {
                $('#client').attr('href', res.clientUrl)
                $('#clientName2').text(res.clientName)
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        }
    });
}

function appendScope(id, scope) {
    const html = `<li class="list-group-item">
<label>
 <input class="consent-scopecheck" type="checkbox"
    name="ScopesConsented"
    id="scopes_${scope.name}"
    value="${scope.name}"
    ${scope.checked ? 'checked="checked"' : ''}
    ${scope.required ? 'disabled="disabled"' : ''} />
    <strong>${scope.displayName}</strong>
    ${scope.required ? '<input type="hidden" name="ScopesConsented" value="' + scope.name + '"/>' : ''}
</label>
${scope.required ? '<span><em>(required)</em></span>' : ''}
${scope.description ? '<div class="consent-description"><label for="scopes_' + scope.name + '">' + scope.description + '</label></div>' : ''}
</li>`;
    $('#' + id).append(html);
}

function initDiagnostics() {
    $.ajax({
        xhrFields: {withCredentials: true},
        type: "GET",
        url: "diagnostics",
        success: function (res) {
            if (res.claims && res.claims.length > 0) {
                const claimsEl = $("#claims");
                for (let i = 0; i < res.claims.length; ++i) {
                    const claim = res.claims[i];
                    claimsEl.append(`<dt>${claim.type}</dt>`);
                    claimsEl.append(`<dd>${claim.value}</dd>`);
                }
            }
            if (res.properties && res.properties.length > 0) {
                const propertiesEl = $("#properties");
                for (let i = 0; i < res.properties.length; ++i) {
                    const property = res.properties[i];
                    propertiesEl.append(`<dt>${property.key}</dt>`);
                    propertiesEl.append(`<dd>${property.value}</dd>`);
                }
            }
        },
        error: function (XMLHttpRequest) {
            if (XMLHttpRequest.status === 401) {
                window.location.href = 'login.html?returnUrl=/diagnostics.html'
            }
        }
    });
}

function initLoggedOut() {
    const postLogoutRedirectUri = getQueryParam('postLogoutRedirectUri');
    const clientName = getQueryParam('clientName');
    const signOutIframeUrl = getQueryParam('signOutIframeUrl');
    const automaticRedirectAfterSignOut = getQueryParam('automaticRedirectAfterSignOut');
    if (postLogoutRedirectUri) {
        $('#clientName').text(clientName);
        $('#postLogoutRedirect').show();
        if (automaticRedirectAfterSignOut) {
            window.location = postLogoutRedirectUri;
        }
    }
    if (signOutIframeUrl) {
        $('#signOutIframe').show();
        $('#signOutIframeUrl').attr('src', signOutIframeUrl);
    } else {
        window.location = "/";
    }
}

function initLogin() {
    $.validator.setDefaults({
        errorContainer: "div.error",
        errorLabelContainer: $("#form div.error"),
        wrapper: "label"
    });
    const message = $('#message');
    $('#sendSmsBtn').click(function () {
        message.hide();
        const phoneNumber = $('#phoneNumber').val();
        if (!phoneNumber || phoneNumber.length > 24 || phoneNumber.length < 11) {
            message.text('手机号不正确')
            message.show();
        } else {
            $.ajax({
                xhrFields: {withCredentials: true},
                type: "POST",
                url: "account/sms",
                dataType: 'json',
                contentType: "application/json",
                data: JSON.stringify({
                    phoneNumber: phoneNumber,
                    countryCode: '+86'
                }),
                success: function (res) {
                    debugger
                    if (res.code !== 200) {
                        if (!res.message) {
                            printError(res.code);
                        } else {
                            const messages = res.message.split('\n');
                            let html = '';
                            for (let i = 0; i < messages.length; ++i) {
                                const message = messages[i];
                                if (!message) {
                                    continue;
                                }
                                html += i == 0 ? message : '<br/>' + message;
                            }
                            message.html(html)
                        }
                        message.show();
                    } else {
                        $('#sendSmsBtn').popover();
                    }
                },
                error: function () {
                    message.show();
                    message.text('服务器出小差')
                }
            });
        }
    });
    $('#loginButton').click(function () {
        const message = $('#message');
        message.hide();
        $("#form").validate({
            rules: {
                username: {
                    required: true
                },
                password: {
                    required: true
                }
            },
            messages: {
                username: {
                    required: "用户名不能为空",
                },
                password: {
                    required: "请输入密码"
                }
            },
            submitHandler: function (form) {
                let returnUrl = getQueryParam("returnUrl");
                returnUrl = returnUrl ? returnUrl : "";
                const data = $(form).serialize() + "&returnUrl=" + encodeURIComponent(returnUrl);
                $.ajax({
                    xhrFields: {withCredentials: true},
                    type: "POST",
                    url: "account/login",
                    data: data,
                    success: function (res, a, b) {
                        if (res.location) {
                            const url = res.location;
                            let win = window;
                            while (win !== win.top) {
                                win = win.top;
                            }
                            win.location.href = url;
                        } else if (res.code !== 200) {
                            if (!res.message) {
                                printError(res.code);
                            } else {
                                const messages = res.message.split('\n');
                                let html = '';
                                for (let i = 0; i < messages.length; ++i) {
                                    const message = messages[i];
                                    if (!message) {
                                        continue;
                                    }
                                    html += i == 0 ? message : '<br/>' + message;
                                }
                                message.html(html)
                            }
                            message.show();
                        } else {
                            // 返回首地址
                            window.location.href = "/";
                        }
                    },
                    error: function () {
                        message.text('服务器出小差')
                        message.show();
                    }
                });
            },
        });
    });
    $('#smsLoginBtn').click(function () {
        message.hide();
        $("#smsForm").validate({
            rules: {
                phoneNumber: {
                    required: true
                },
                verifyCode: {
                    required: true
                }
            },
            messages: {
                phoneNumber: {
                    required: "手机号不能为空",
                },
                verifyCode: {
                    required: "请输入验证码"
                }
            },
            submitHandler: function (form) {
                let returnUrl = getQueryParam("returnUrl");
                returnUrl = returnUrl ? returnUrl : "";
                const data = $(form).serialize() + "&returnUrl=" + encodeURIComponent(returnUrl);
                debugger
                $.ajax({
                    xhrFields: {withCredentials: true},
                    type: "POST",
                    url: "account/loginBySms",
                    data: data,
                    success: function (res, a, b) {
                        if (res.location) {
                            const url = res.location;
                            let win = window;
                            while (win !== win.top) {
                                win = win.top;
                            }
                            win.location.href = url;
                        } else if (res.code !== 200) {
                            if (!res.message) {
                                printError(res.code);
                            } else {
                                const messages = res.message.split('\n');
                                let html = '';
                                for (let i = 0; i < messages.length; ++i) {
                                    const message = messages[i];
                                    if (!message) {
                                        continue;
                                    }
                                    html += i == 0 ? message : '<br/>' + message;
                                }
                                message.html(html)
                            }
                            message.show();
                        } else {
                            debugger
                            // 返回首地址
                            window.location.href = "/";
                        }
                    },
                    error: function () {
                        message.text('服务器出小差')
                        message.show();
                    }
                });
            },
        });
    });
}

function initChangePassword() {
    $.validator.setDefaults({
        errorContainer: "div.error",
        errorLabelContainer: $("#form div.error"),
        wrapper: "label"
    });
    $('#submitButton').click(function () {
        const message = $('#message');
        message.hide();
        $("#form").validate({
            rules: {
                username: {
                    required: true
                },
                password: {
                    required: true
                },
                oldPassword: {
                    required: true
                },
                confirmNewPassword: {
                    required: true
                },
            },
            messages: {
                username: {
                    required: "用户名不能为空",
                },
                password: {
                    required: "请输入密码"
                }
            },
            submitHandler: function (form) {
                const data = $(form).serialize();
                $.ajax({
                    xhrFields: {withCredentials: true},
                    type: "POST",
                    url: "account/resetPassword2",
                    data: data,
                    success: function (res, a, b) {
                        if (res.code !== 200) {
                            message.show();
                            if (!res.message) {
                                printError(res.code);
                            } else {
                                const messages = res.message.split('\n');
                                let html = '';
                                for (let i = 0; i < messages.length; ++i) {
                                    const message = messages[i];
                                    if (!message) {
                                        continue;
                                    }
                                    html += i == 0 ? message : '<br/>' + message;
                                }
                                message.html(html)
                            }
                        } else {
                            // 返回首地址
                            window.location.href = "/";
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        message.show();
                        message.text('服务器出小差')
                    }
                });
            },
        });
    });
}

function initLogout() {
    const logoutId = getQueryParam('logoutId');
    $("#logoutId").val(logoutId);
}

function initSession() {
    $.get("session", (res) => {
        if (res.data && res.data.some(x => x.type == "sub")) {
            const user = $("#user");
            user.attr("sub", res.data.sub);
            let claims = res.data.filter(x => x.type == "name");
            let name = '';
            if (claims.length == 0) {
                claims = res.data.filter(x => x.type == "email");
            }
            name = claims[0].value;
            user.prepend(name);
            $("#userNav").show();
        }
    });
}

function getQueryParam(queryName) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const value = urlSearchParams.get(queryName);
    return value;
}