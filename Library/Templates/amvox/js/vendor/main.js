/*
* OpenK Tecnologia em Sistemas LTDA 2013
* Av. Athayde de Deus Vieira, 69 - Tibery
* CEP 38405-150 - Uberlandia/MG
* +55 (34) 3238-2222 - comercial@openk.com.br

* Author: Eduardo Jos� Ribeiro Soares
* E-mail [1]:eduardo.ribeiro@openk.com.br
* E-mail [2]:eduardodeiturama@hotmail.com
*/

xOffset = 10;
yOffset = 30;

/* END CONFIG */
$("a.preview").live("mouseenter", function (e) {
    this.t = this.title;
    this.title = "";
    var c = (this.t != "") ? "<br/>" + this.t : "";
    $("body").append("<p id='preview'><img src='" + this.href + "' alt='Image preview' />" + c + "</p>");
    $("#preview")
        .css("top", (e.pageY - xOffset - $("#preview").height()) + "px")
        .css("left", (e.pageX + yOffset) + "px")
        .fadeIn("fast");
}).live("mouseleave", function () {
    this.title = this.t;
    $("#preview").remove();
}).live("mousemove", function (e) {
    $("#preview")
        .css("top", (e.pageY - xOffset - $("#preview").height()) + "px")
        .css("left", (e.pageX + yOffset) + "px");
});

function findPictureSizeSelected(c) {
    var p = $('#prodId').val();
    photoByCombination(p, c);
};
function photoByCombination(p, c) {
    $.ajax({
        type: "POST",
        dataType: "text",
        url: "/Library/Ajax/FotoCombinacao.aspx",
        data: { produto_id: p, combinacao_atributo_id: c },
        cache: false,
        async: true,
        success: function (result) {
            if (result != null) {
                result = JSON.parse(result);
                var zoom = $($.grep($(result.Fotos[0]), function (e) { return e.Identificador == 'ZOOM'; })).get(0);
                var detail = $($.grep($(result.Fotos[0]), function (e) { return e.Identificador == 'DETALHE'; })).get(0);

                $("#wrap").html("<a href='" + (zoom.CombinacaoAtributoId == c ? zoom.DescricaoFoto : "/App_Themes/amvox/images/not-found.jpg") + "' class='cloud-zoom photo' id='zoom1' title='" + result.ProdutoNome + "'><img src='" + (detail.CombinacaoAtributoId == c ? detail.DescricaoFoto : "/App_Themes/amvox/images/not-found.jpg") + "' alt='" + result.ProdutoNome + "' class='photo image' width='500' />");

                var thumbs = $(".thumbnails .list");
                thumbs.empty();

                $(result.Fotos).each(function (index) {
                    var thumbnail = $($.grep(this, function (e) { return e.Identificador == 'MINIATURA'; })).get(0);
                    detail = $($.grep(this, function (e) { return e.Identificador == 'DETALHE'; })).get(0);
                    zoom = $($.grep(this, function (e) { return e.Identificador == 'ZOOM'; })).get(0);

                    thumbs.append(
                        $("<a />", { "data-src": (zoom.CombinacaoAtributoId == c ? zoom.DescricaoFoto : "/App_Themes/amvox/images/not-found.jpg"), href: (detail.CombinacaoAtributoId == c ? detail.DescricaoFoto : "/App_Themes/amvox/images/not-found.jpg") }).append(
                            $("<img />", { alt: result.ProdutoNome, title: result.ProdutoNome, src: (thumbnail.CombinacaoAtributoId == c ? thumbnail.DescricaoFoto : "/App_Themes/amvox/images/not-found.jpg"), width: 70 })
                        )
                    );
                });

                $('.cloud-zoom').CloudZoom();

                if ($('div.thumbnails div.list a').length > 0) {
                    $('div.thumbnails div.list a').bind('click', function (event) {
                        event.preventDefault();
                        var elem = $(this);
                        var src = elem.attr('href');
                        var zoom = elem.attr('data-src');
                        var title = elem.children('img').attr('title');
                        elem.parent().children('a').removeClass('active');
                        elem.addClass('active');
                        $('.photo.image').attr({ 'src': src, 'title': title, 'alt': title });
                        $('.cloud-zoom').attr('href', zoom).CloudZoom();
                    }).first().trigger('click');
                }

                //$("div.thumbnails div.list").slick({
                //    vertical: true,
                //    infinite: false,
                //    slidesToShow: 4,
                //    slidesToScroll: 1
                //});
            }
        },
        error: function (txt, data) {
            error(txt.responseText.message);
        }
    });
};
function atualizarCombinacoes(combinacao, clientId, produtoid, el) {
    var ordem = $(el).attr("data-ordem");
    var qtd = $(".selectCombinacao").length;
    for (var i = ordem - 1; i >= 0; i--) {
        $(".selectCombinacao[data-ordem='" + i + "']").html('<option value="-1">Carregando...</option>');
    }
    $(".selectCombinacao").attr("disabled", "disabled");
    if (combinacao != -1) {
        $.ajax({
            type: 'POST',
            url: '/Library/Ajax/CombinacaoAtributo.aspx',
            cache: false,
            data: { combinacao: combinacao.toString(), clientId: clientId.toString(), produtoid: produtoid },
            success: function (txt) {
                $(".selectCombinacao").removeAttr("disabled").removeClass("focus");
                if ($(".selectCombinacao[data-ordem='" + (ordem - 1) + "']").length > 0) {
                    $(".selectCombinacao[data-ordem='" + (ordem - 1) + "']").html(txt).addClass("focus");
                }
            },
            error: function (txt, data) {
                error($.evalJSON(txt.responseText).message);
                setTimeout(kill, 3000);
            }
        });
    }
}
function selectCombinacaoEvent(el, load) {
    window.presential = false;
    window.cepvalor = false;
    if (load) {
        var client_id = $(el).attr("data-client");
        var id = $(el).attr("data-id");
        atualizarCombinacoes(el.value, client_id, id, el);
    }
}

function getStarsAutocomplete(avaliacao) {
    var html = "";
    if (avaliacao > 0) {
        html = '<span class="stars small">';
        var avaliacaoDescricao = ["P�ssimo", "Ruim", "Bom", "�timo", "Excelente"];
        for (var i = 1; i <= 5; i++) {
            html += '<span href="javascript:void(0)" ' + (avaliacao-- > 0 ? 'class="active"' : '') + ' title="' + avaliacaoDescricao[i - 1] + '">' + i + '</span>';
        }
        html += '</span><br>';
    } else {
        html = '<span class="stars small">'
        var avaliacaoDescricao = ["P�ssimo", "Ruim", "Bom", "�timo", "Excelente"];
        for (var i = 1; i <= 5; i++) {
            html += '<span href="javascript:void(0)" title="' + avaliacaoDescricao[i - 1] + '">' + i + '</span>';
        }
        html += '</span><br>'
    }
    return html;
}
function submitPreRegister() {
    var filter = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    var field = $("#email_cadastro");
    if (!filter.test(field.val()) || field.val() == "") {
        jAlert('Informe um e-mail v&aacute;lido!');

        field.focus();
    } else {
        $.ajax({
            type: 'POST',
            url: '/Library/Ajax/Login.aspx',
            cache: false,
            data: {
                acao: 11,
                email: field.val()
            },
            dataType: "text",
            beforeSend: function () {
                jInfo('<div style="width:300px"><img src="/App_Themes/amvox/images/4.gif" width=\"30\" /><br><h3 style="margin-top:20px;font-family:\'dosismedium\'">Verificando seu e-mail, aguarde...</h3></div>', "");
                $("#popup_title").remove();
            },
            success: function (dados) {
                dados = $.evalJSON(dados);
                if (dados.existe) {
                    jAlert('Usu&aacute;rio j&aacute; cadastrado, por favor, informe outro e-mail.');
                } else {
                    jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Redirecionando, aguarde...</h3>", "");
                    window.location.href = "/CadastroUsuario.aspx?email=" + field.val() + "&returnpage=%2fPagamento.aspx";
                }
            },
            error: function (txt) {
                console.log(txt);
            }
        });
    }
}

var usrlogged = false;
var trylogin = false;
function refreshLazyLoad() {
    if (document.location.pathname.indexOf("consulta") > -1) {
        $('html, body').animate({ scrollTop: $(document).scrollTop() + 1 }, 1, function () {
            $('html, body').animate({ scrollTop: $(document).scrollTop() - 1 }, 1, function () { $('html, body').animate({ scrollTop: $("#left_aside").offset().top - 100 }, 300); });
        });
    } else {
        $('html, body').animate({ scrollTop: $(document).scrollTop() + 1 }, 1, function () {
            $('html, body').animate({ scrollTop: $(document).scrollTop() - 1 }, 1);
        });
    }
}
function checkKeyCode(event) {
    var keyCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
    return keyCode;
}
function pagerFactory(idx) {
    return '<li><a href="javascript:void(0)" title="P&aacute;gina ' + (idx + 1) + '">' + (idx + 1) + '</a></li>';
}
function kill() {
    $.alerts._hide();
}
function rebuildMasks() {
    $('.calendario').setMask({ mask: '99/99/9999', autoTab: false });
    $('.numeric').setMask({ mask: '999999999', autoTab: false });
    $('.mask-cep').setMask({ mask: '99.999-999', autoTab: false });
    $('.mask-cpf').setMask({ mask: '999.999.999-99', autoTab: false });
    $('.mask-telefone').setMask({ mask: '(99)999999999', autoTab: false });
    $('.mask-cnpj').setMask({ mask: '99.999.999/9999-99', autoTab: false });
    $(".mask-cartao").setMask({ mask: '9999 9999 9999 9999', autoTab: false });
}

function dispatchEventTrigger(e) {
    e = e.toUpperCase();
    switch (e) {
        case "PAGAMENTO.ASPX":
            $("#link_change_address").trigger("click");
            break;
        default:
            break;
    }
}
function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
};
$.validator.addMethod("check_item_dropdown", function (value, element) {
    if (this.optional(element) || value != -1) {
        $(element).removeClass('error');
        return true;
    } else {
        $(element).addClass('error');
        return false;
    }
}, "Por favor, selecione.");
$.validator.addMethod("validateEmail", function (value, element) {
    if (isValidEmailAddress(value)) {
        return true;
    } else {
        return false;
    }
}, "E-mail inv&aacute;lido.");
function rebuildChangeAddress() {
    rebuildMasks();
    $("#popup_container .form_fields input, #popup_container .form_fields select").each(function () {
        var id = $(this).attr("id");
        if (id) {
            $(this).attr("id", id + "-modal");
        }

        var name = $(this).attr("name");
        if (name) {
            $(this).attr("name", name + "-modal");
        }
    });
    $("#popup_container .needed").each(function (i) {
        if ($(this).is("select")) {
            $(this).rules("add", {
                check_item_dropdown: true,
                messages: {
                    check_item_dropdown: "Informe o Estado."
                }
            });
        } else {
            $(this).rules("add", {
                required: true,
                messages: {
                    required: "Este campo &eacute; requerido."
                }
            });
        }
    });
    $('#popup_container #search-change-cep-modal').bind("click", function () {
        var cep = $('#popup_container #change-cep-modal').val().replace('.', '').replace('-', '');
        if (cep.length == 8) {
            $.ajax({
                type: 'POST',
                url: '/Library/Ajax/Cep.aspx',
                cache: false,
                data: { Cep: cep },
                dataType: "text",
                beforeSend: function () {
                    $("#popup_container .loader").show().children('.message').html('Buscando endere&ccedil;o...');
                },
                success: function (endereco) {
                    if (endereco != null && endereco != "") {
                        endereco = $.evalJSON(endereco);
                        $("#popup_container #change-addressX-modal").val(endereco.logradouro);
                        $("#popup_container #change-neighborhood-modal").val(endereco.bairro);
                        $("#popup_container #change-city-modal").val(endereco.municipio);
                        $("#popup_container #change-state-modal").val(endereco.sigla);

                        $("#popup_container .loader").addClass('correct').children('.message').html('Endere&ccedil;o encontrado.');
                    } else {
                        $("#popup_container .loader").addClass('error').children('.message').html('CEP Inv&aacute;lido, tente novamente.');
                    }
                    setTimeout(function () {
                        $("#popup_container .loader").fadeOut(200, function () {
                            $(this).removeClass('correct');
                            $("#popup_container #change-number-modal").focus();
                        });
                    }, 2000);
                },
                error: function (txt, data) {
                    error();
                }
            });
        }
    });
    $('#popup_container #change-cep-modal').bind('focusout', function () {
        $('#popup_container #search-change-cep-modal').trigger("click");
    });
    $('#change-submit-modal').bind('click', function (e) {
        e.preventDefault();
        $("#senha").val($("#change-password-modal").val());
        if ($("form").valid()) {
            if ($("body").attr("id") == "change_person_legal")
                changeRegistration(true);
            else
                changeRegistration();
        }
    });
    $("form.changeRegistration #change-password-modal").bind('keypress', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            $("#change-submit-modal").trigger("click");
        }
    });
}
function rebuildAvailabilityWarn() {
    rebuildMasks();
    var awData = [];
    $("#popup_container #teste").validate();
    $("#popup_container .form_fields input").each(function () {
        var id = $(this).attr("id");
        if (id) {
            $(this).attr("id", id + "_modal");
        }

        var name = $(this).attr("name");
        if (name) {
            $(this).attr("name", name + "_modal");
        }
    });
    $("#popup_container .needed").each(function (i) {
        var e = $(this);
        e.rules("add", {
            required: true,
            email: e.attr("id") == "aw_mail_modal" ? true : false,
            messages: {
                required: "Este campo &eacute; requerido.",
                email: "E-mail inv&aacute;lido."
            }
        });

        awData.push(e);
    });
    $("div.form_fields.comment input, div.form_fields.comment textarea").addClass("ignore");
    $('#aw_submit_modal').bind('click', function (e) {
        e.preventDefault();
        if ($("#popup_container #teste").valid()) {
            $.ajax({
                type: 'POST',
                url: '/Library/Ajax/ManterAviseMe.aspx',
                cache: false,
                data: { nome: awData[0].val(), email: awData[2].val(), produto: $("#prodId").val(), fonecontato: awData[1].val() },
                dataType: 'text',
                beforeSend: function () {
                    $("#popup_container .loader").show().children('.message').html('Processando, aguarde...');
                },
                success: function (txt) {
                    jInfo("<img src='/App_Themes/amvox/images/sucess.png'><br><br><h4>Solicita&ccedil;&atilde;o de avise-me salva com sucesso.</h4><h4>Fique atento &agrave;s novidades e promo&ccedil;&otilde;es da nossa loja online.</h4><h4>Boas Compras!</h4>", "Sucesso");
                    setTimeout(kill, 7000);
                    $("div.form_fields.comment input, div.form_fields.comment textarea").removeClass("ignore");
                },
                error: function () {
                    error();
                    $("div.form_fields.comment input, div.form_fields.comment textarea").removeClass("ignore");
                }
            });
        }
    });
}
function contactSend() {
    var nome = $("#desNome").val();
    var email = $("#desEmail").val();
    var assuntoid = $("#desCanalAtendimento").val();
    var telefone = $('#desTelefone').val();
    var mensagem = $("#desMensagem").val();
    if (assuntoid == "-1") {
        jAlert('Por favor, selecione o Assunto.', 'Atendimento');
        setTimeout(kill, 3000);
    } else {
        $.ajax({
            type: 'POST',
            url: '/Library/Ajax/FaleConosco.aspx',
            cache: false,
            dataType: "text",
            data: { acao: "1", nome: nome, email: email, mensagem: mensagem, assuntoid: assuntoid, telefone: telefone },
            beforeSend: function () {
                jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Enviando, aguarde...</h3>", "Atendimento");
            },
            success: function (faleconosco) {
                faleconosco = $.evalJSON(faleconosco);
                kill();
                if (faleconosco.erro) jAlert(faleconosco.mensagem, 'Atendimento');
                else {
                    jAlert('Prezado(a) <strong>' + nome + '</strong>, seu formul&aacute;rio foi enviado com sucesso!<br /><br /><strong>Obrigado.</strong>', 'Sucesso');
                    document.getElementById('aspnetForm').reset();
                    setTimeout(kill, 7000);
                }
            },
            error: function () {
                error();
                setTimeout(kill, 3000);
            }
        });
    }
}
function rate(evaluation, title, comment, product, user, shop) {
    if (evaluation != undefined) {
        loginCheck();

        if (user == undefined || user == 0) {
            jConfirm('Voc&ecirc; precisa estar logado para essa opera&ccedil;&atilde;o \n Clique em OK para ser \Redirecionado.', 'Aten&ccedil;&atilde;o', function (r) {
                if (r) {
                    jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Processando, aguarde...</h3>", "");

                    window.location.href = urlcarrinho + '/Login.aspx?returnpage=' + window.location.href;
                }
            });
        } else {
            $.ajax({
                type: 'POST',
                url: '/Library/Ajax/AvalicaoProduto.aspx',
                cache: false,
                async: false,
                data: { acao: '1', lojaID: shop, prodID: product, usuarioID: user, titulo: title, comentario: comment, nota: evaluation },
                //dataType: "application/json",
                dataType: 'jsonp',
                beforeSend: function () {
                    jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Enviando, aguarde...</h3>", "");
                },
                success: function (avaliacao) {
                    if (avaliacao.postado) {
                        var nomusr = '';
                        try {
                            nomusr = $.cookie('NomUsr').split('&')[0].split('=')[1].toString().split(' ')[0];
                        }
                        catch (e) {
                            nomusr = $.cookie('NomUsr');
                        }
                        jConfirm('Prezado(a) <strong>' + nomusr + '</strong>, sua avalia&ccedil;&atilde;o foi enviada para aprova&ccedil;&atilde;o.<br /><br /><strong>Obrigado por escolher a <a href="http://www.amvox.com.br/">QCOMPRA</a>.</strong>', 'Sucesso!', function (e) {
                            if (e)
                                window.location.reload();
                        });
                    } else {
                        error();
                    }
                },
                erro: function (txt, data) {
                    error();
                }
            });
        }
    } else {
        jInfo('Informe a quantidade de estrelas para a Avalia&ccedil;&atilde;o Geral.', "");
        setTimeout(kill, 3000);
    }
};
function changepassword() {
    var newPass = $("#desNovaSenha").val();
    var pass = $("#desSenhaAtual").val();

    $.ajax({
        type: 'POST',
        url: '/Library/Ajax/Login.aspx',
        cache: false,
        data: { acao: 7, senha: pass, novasenha: newPass },
        dataType: "text",
        beforeSend: function () {
            jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Processando, aguarde...</h3>", "Minha Conta");
        },
        success: function (login) {
            login = $.evalJSON(login);
            if (login.sucesso) {
                jConfirm('Senha alterada com sucesso!<br><br>Clique em OK para ser redirecionado.', 'Sucesso', function (retorno) {
                    if (retorno) {
                        jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Redirecionando, aguarde...</h3>", "");
                        window.location.href = '/MinhaConta.aspx';
                    }
                });
            } else {
                jAlert(login.mensagemerro, 'Minha Conta');
                setTimeout(kill, 3000);
            }
        },
        error: function (txt, data) {
            error(txt.responseText.message);
            setTimeout(kill, 3000);
        }
    });
}
function updateCart(compras) {
    $(".shopping_cart .product-count").html(compras.QuantidadeTotalItens);
    $(".shopping_cart .price").html(compras.ValorTotal.toFixed(2).toString().replace('.', ','));
    $("#ValorTotalCarrinho").val(compras.ValorTotal.toFixed(2).toString().replace('.', ','));
    $("#ValorTotalGeral").html(compras.ValorTotal.toFixed(2).toString().replace('.', ','));
    $("#ValorTotalBoleto").html(compras.ValorTotalBoleto.toFixed(2).toString().replace('.', ','));
}
function changeRegistration(pj) {
    var sexo = "M";
    var rg, orgaoexpeditor, cpf, razaosocial, inscricao, cnpj;
    if (!pj) {
        rg = $('#rg').val();
        orgaoexpeditor = $('#orgaoexpeditor').val();
        cpf = $('#cpf').val().replace(/\./g, '').replace('-', '');
    } else {
        if ($('#feminino:checked').length > 0) sexo = "F";
        razaosocial = $('#razaosocial').val();
        inscricao = $('#inscricaoestadual').val();
        cnpj = $('#usrCnpj').val();
    }
    var usuarioid = $('#usrId').val();
    var enderecoid = $('#addressId').val();
    var nome = $('#nome').val();
    var email = $('#usrEmail').val();

    var datanascimento = $('#datanascimento').val();
    var senha = $('#senha').val();
    if ($("#change-password-modal").length > 0 && $("#change-password-modal").val().length > 0)
        senha = $("#change-password-modal").val();
    var cep = ($("#change-cep-modal").length > 0 && $("#change-cep-modal").val().length > 0) ? $("#change-cep-modal").val().replace('.', '').replace('-', '') : "";
    var logradouro = ($("#change-addressX-modal").length > 0 && $("#change-addressX-modal").val().length > 0) ? $("#change-addressX-modal").val() : "";
    var numero = ($("#change-number-modal").length > 0 && $("#change-number-modal").val().length > 0) ? $("#change-number-modal").val() : "";
    var complemento = ($("#change-complement-modal").length > 0 && $("#change-complement-modal").val().length > 0) ? $("#change-complement-modal").val() : "";
    var referencia = ($("#change-reference-modal").length > 0 && $("#change-reference-modal").val().length > 0) ? $("#change-reference-modal").val() : "";
    var bairro = ($("#change-neighborhood-modal").length > 0 && $("#change-neighborhood-modal").val().length > 0) ? $("#change-neighborhood-modal").val() : "";
    var cidade = ($("#change-city-modal").length > 0 && $("#change-city-modal").val().length > 0) ? $("#change-city-modal").val() : "";
    var estado = ($("#change-state-modal").length > 0 && $("#change-state-modal").val().length > 0) ? $("#change-state-modal").val() : "";

    var foneresidencial = $('#telefoneNumero').val();
    var fonecelular = $('#celularNumero').val();

    $.ajax({
        type: 'POST',
        url: '/Library/Ajax/Login.aspx',
        dataType: "text",
        data: {
            acao: 5,
            usuarioid: usuarioid,
            enderecoid: enderecoid,
            nome: nome,
            razaosocial: (pj ? razaosocial : ""),
            inscricao: (pj ? inscricao : ""),
            cnpj: (pj ? cnpj : ""),
            sexo: sexo,
            datanascimento: datanascimento,
            cpf: (pj ? "" : cpf),
            rg: (pj ? "" : rg),
            orgaoexpeditor: (pj ? "" : orgaoexpeditor),
            email: email,
            foneresidencial: foneresidencial,
            fonecelular: fonecelular,
            passowrd: senha,
            cep: cep,
            logradouro: logradouro,
            numero: numero,
            complemento: complemento,
            referencia: referencia,
            bairro: bairro,
            cidade: cidade,
            estado: estado
        },
        cache: false,
        beforeSend: function () {
            if ($("#popup_container .message").length > 0)
                $("#popup_container .loader").show().children('.message').html('Processando, aguarde...');
            else {
                jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Processando, aguarde...</h3>", "");
            }
        },
        success: function (login) {
            var objeto = $.evalJSON(login);
            if (objeto.sucesso) {
                if ($("#popup_container .message").length > 0)
                    $("#popup_container .loader").addClass("correct").children('.message').html('Cadastro alterado com sucesso.<br><br>Aguarde...');
                else
                    jInfo('Cadastro alterado com sucesso.<br><br>Aguarde enquanto a p&aacute;gina &eacute; atualizada...', 'Minha Conta');
                setTimeout(function () {
                    if (getParameterByName('returnpage').length > 0)
                        window.location.href = getParameterByName('returnpage');
                    else
                        window.location.reload();
                }, 1000);
            } else {
                jAlert('Usu&aacute;rio e ou senha invalidos.', 'Minha Conta');
                setTimeout(function () {
                    $.alerts._hide();
                }, 3000);
            }
        },
        error: function () {
            jAlert('N&atilde;o foi poss&iacute;vel completar sua solicita&ccedil;&atilde;o! Tente Novamente.', 'Minha Conta');
            setTimeout(function () {
                $.alerts._hide();
            }, 3000);
        }
    });
}
function atualizaSacolaPopUp(compras) {
    if (compras != null) {
        updateCart(compras);
    } else {
        $.ajax({
            type: 'POST',
            url: '/Library/Ajax/CarrinhoMiniVisao.aspx',
            data: { acao: 1 },
            dataType: "text",
            beforeSend: function () {
            },
            success: function (result) {
                updateCart($.evalJSON(result));
            },
            error: function (e, ex) {
                //error();
            }
        });
    }
}
function calculaFrete(cep, showLoading) {
    if (cep) {
        $.ajax({
            type: 'POST',
            url: '/Library/Ajax/Frete.aspx',
            cache: false,
            data: { cep: cep, acao: 1 },
            datatype: 'text',
            beforeSend: function () {
                if (showLoading == null || showLoading != 'hide') {
                    jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Verificando formas de envio dispon&iacute;veis, aguarde...</h3>", "Calcular Frete");
                }
            },
            success: function (txt) {
                if (txt.length > 0) {
                    if (showLoading == null || showLoading != 'hide')
                        kill();

                    $("#delivery_options").html(txt);

                    if ($("#delivery_options option[value!='-1']").length == 1) {
                        $("#delivery_options option[value!='-1']").attr("selected", "selected");
                        $("#delivery_options").trigger("change");
                    }

                    $('#numCepFrete').removeClass('error');
                }
                else {
                    $(".cart_dispatch .options").html('<label>Nenhuma forma de envio dispon&iacute;vel para este CEP.</label>');
                    jAlert('Nenhuma forma de envio dispon&iacute;vel para este CEP.', 'Calcular Frete');
                }
            },
            error: function () {
                jAlert('Falha ao verificar as formas de envio.');
                $(".cart_dispatch .options").html('<label>Falha ao verificar as formas de envio.</label>');
            }
        });
    }
}
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}
function loginCheck() {
    var nomusr = 'visitante!';
    if ($.cookie('NomUsr') == null || $.cookie('NomUsr').toString() == '') {
        usrlogged = false;
        $("header#initial .offline").show();
        $("header#initial .logged").hide();
        $("header#initial .user").show();
        $("header#initial .logged_in_user").hide();
        $("#logout").removeClass("visible");
    }
    else {
        try {
            nomusr = $.cookie('NomUsr').split('&')[0].split('=')[1].toString().split(' ')[0];
            $('#usrId').val($.cookie('NomUsr').split('&')[1].split('=')[1]);
        }
        catch (e) {
            nomusr = $.cookie('NomUsr');
        }
        usrlogged = true;
        $("header#initial .offline").hide();
        $("header#initial .logged").show();
        $("#logout").addClass("visible");
        $("header#initial .user").hide();
        $("header#initial .logged_in_user").show();

        $("#user_name").html(nomusr);
        return true;
    }
    if (!usrlogged && !trylogin) {
        $.ajax({
            type: 'POST',
            url: '/Library/Ajax/Login.aspx',
            cache: false,
            async: false,
            data: { acao: 1, returnpage: getParameterByName('returnpage') },
            dataType: "text",
            success: function (login) {
                login = $.evalJSON(login);
                trylogin = true;
                if (login.logado) {
                    nomusr = '';
                    try {
                        nomusr = $.cookie('NomUsr').split('&')[0].split('=')[1].toString().split(' ')[0];
                    }
                    catch (ex) {
                        nomusr = $.cookie('NomUsr');
                    }

                    if (login.returnpage.length > 0) {
                        window.location.href = login.returnpage;
                    }
                }
                $("#user_name").html(nomusr);
            },
            error: function (txt, data) {
                error($.evalJSON(txt.responseText).message);
            }
        });
    }
}
function atualizaDadosEndereco(endereco) {
    var objeto = endereco;
    $('#desBairro , #ctl00_UCCadastraEndereco1_ctl00_TextEnderecoBairro1').val(objeto.bairro);
    $('#indSiglaUf, #ctl00_UCCadastraEndereco1_ctl00_DdlEnderecoUF2').val(objeto.sigla);
    $('#nomCidade , #ctl00_UCCadastraEndereco1_ctl00_TextEnderecoCidade1').val(objeto.municipio);
    $('#desEndereco , #ctl00_UCCadastraEndereco1_ctl00_TextEnderecoLogradouro1').val(objeto.logradouro);
    $('#numEndereco , #ctl00_UCCadastraEndereco1_ctl00_TextEnderecoNumero2').focus();
}
function productQuantity(el) {
    var id = el.attr("data-id").split('_')[0];
    var combinacao = el.attr("data-id").split('_')[1];
    jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Processando, aguarde...</h3>", "Quantidade de Produtos");
    if (el.val() >= 1) {
        $.ajax({
            type: 'POST',
            url: '/Library/Ajax/CarrinhoMiniVisao.aspx',
            cache: false,
            data: { acao: "6", id: id, combinacao: combinacao, quantidade: el.val() },
            dataType: "text",
            beforeSend: function () { },
            success: function (compras) {
                try {
                    compras = $.evalJSON(compras);
                    kill();
                    setTimeout(function () {

                    }, 1500);
                    $(".shopping_cart .product-count").html(compras.QuantidadeTotalItens);
                    $(".shopping_cart .price").html(compras.valorsubtotal);
                    $('#ValorTotalCarrinho').html(compras.valorsubtotal);
                    $('#ValorTotalBoleto').html(compras.ValorTotalBoleto);
                    $('#ValorTotalGeral').html(compras.ValorTotal);
                    $('#ValorFreteSelecionado').html(compras.valorfrete);
                    $('#DescontoCarrinho').html(compras.valordesconto);
                    $('tr[data-id=' + id + '_' + combinacao + ']').find('.valortotalitem').first().html('R$ ' + compras.valortotalitem);
                    $('tr[data-id=' + id + '_' + combinacao + ']').find('.valoritem').first().html('R$ ' + compras.valoritem);
                    var cep = $("#numCepFrete").val().replace('-', '').replace('.', '');
                    if (!isNaN(cep) && cep.length > 0) {
                        calculaFrete(cep);
                    }

                } catch (err) {
                    jAlert(compras, 'Aviso');
                    el.val(compras.split('limitado a ')[1].split(' unidades')[0]);
                }
                atualizaSacolaPopUp();
            },
            error: function (txt) {
                atualizaSacolaPopUp();
            }
        });
    }
    else {
        error();
        atualizaSacolaPopUp();
    }
}
function register(pj) {
    if ($('#indTermosDeUso:checked').length > 0) {
        var nome, sexo, cpf, rg, orgaoexpeditor, razao, nomeFantasia, cnpj, inscricao;
        if (!pj) {
            nome = $('#desNome').val();
            sexo = 'M';
            if ($('#indSexoM').attr('checked')) sexo = $('#indSexoM').val().toUpperCase();
            if ($('#indSexoF').attr('checked')) sexo = $('#indSexoF').val().toUpperCase();
            cpf = $('#numCpf').val().replace(/\./g, '').replace('-', '');
            rg = $('#identidade').val();
            orgaoexpeditor = $('#orgaoemissor').val();
        } else {
            razao = $("#desRazaoSocial").val();
            nomeFantasia = $("#desNomeFantasia").val();
            cnpj = $("#numCnpj").val().replace(/\./g, '').replace('-', '').replace('/', '');
            inscricao = $("#desInscricaoEstadual").val();
        }

        var datanascimento = $('#dtaNascimento').val();
        var email = $('#desEmail').val();
        var senha = $('#desSenha').val();
        var cep = $('#numPrefixoCep').val().replace('-', '').replace('.', '');
        var bairro = $('#desBairro').val();
        var cidade = $('#nomCidade').val();
        var estado = $('#indSiglaUf').val();
        var logradouro = $('#desEndereco').val();
        var tipologradouro = $('#indTipoLogradouro').val();
        var numero = $('#numEndereco').val();
        var complemento = $('#desComplemento').val();
        var referencia = $('#desReferencia').val();
        var newsletter = false;
        var categorias = '';
        if ($('#indReceberNews:checked').length > 0) {
            newsletter = true;
            $('[CodigoCategoria]').each(function () {
                categorias = categorias + $(this).attr('CodigoCategoria') + '|';
            });
        }
        var destinatario = $('#identificador').val();

        /*Campos ADICIONAIS */

        var foneresidencial = $('#numTelRes').val();
        var fonecelular = $('#telefoneCelular').val();
        var fonecontato = fonecelular;
        var page = getParameterByName('returnpage');
        if (page == null || page == '') {
            page = urlnavegacaoloja + '/Default.aspx';
        }

        $.ajax({
            type: 'POST',
            url: '/Library/Ajax/Login.aspx',
            data: {
                acao: 2,
                razaosocial: (pj ? razao : ""),
                inscricao: (pj ? inscricao : ""),
                cnpj: (pj ? cnpj : ""),
                nome: (pj ? nomeFantasia : nome),
                sexo: (pj ? "M" : sexo),
                datanascimento: datanascimento,
                cpf: (pj ? "" : cpf),
                rg: (pj ? "" : rg),
                orgaoexpeditor: (pj ? "" : orgaoexpeditor),
                email: email,
                passowrd: senha,
                cep: cep,
                bairro: bairro,
                cidade: cidade,
                estado: estado,
                logradouro: logradouro,
                numero: numero,
                complemento: complemento,
                destinatario: destinatario,
                foneresidencial: foneresidencial,
                fonecelular: fonecelular,
                fonecontato: fonecontato,
                newsletter: newsletter,
                categorias: categorias,
                returnpage: page,
                tipologradouro: tipologradouro,
                referencia: referencia
            },
            cache: false,
            dataType: "text",
            beforeSend: function () {
                jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Processando, aguarde...</h3>", "Cadastro");
            },
            success: function (login) {
                kill();
                var objeto = $.evalJSON(login);
                if (objeto.logado) {
                    var url = urlnavegacaoloja + '/';
                    jConfirm('Cadastro realizado com sucesso!<br><br>Fique atento &agrave;s novidades e promo&ccedil;&otilde;es da nossa loja online. <strong>Boas Compras!</strong><br><br>Clique em OK para ser redirecionado.', 'Sucesso', function (retorno) {
                        if (retorno) {
                            jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Redirecionando, aguarde...</h3>", "Sucesso");
                            if (objeto.returnpage.length > 0) {
                                url = window.location.href = objeto.returnpage;
                            } else {
                                url = urlnavegacaoloja + '/Default.aspx';
                            }
                            window.location.href = url;
                        }
                    });
                } else {
                    jAlert(objeto.mensagemerro, 'Cadastro');
                    setTimeout(kill, 3000);
                }
            },
            error: function () {
                error("Falha ao realizar o Cadastro.");
                setTimeout(kill, 3000);
            }
        });
    } else {
        jInfo('Leia o contrato e aceite as condi&ccedil;&otilde;es antes de se cadastrar.', 'Cadastro');
        setTimeout(kill, 5000);
    }
}
function log(user, pass) {
    if (user.val().length == 0) {
        jInfo('Primeiro preencha seu email', 'Identifica&ccedil;&atilde;o do cliente');
        user.addClass('error');
        setTimeout(function () {
            kill();
            user.focus();
        }, 3000);
    } else if (pass.val().length == 0) {
        jInfo('Primeiro preencha sua senha', 'Identifica&ccedil;&atilde;o do cliente');
        pass.addClass('error');
        setTimeout(function () {
            kill();
            pass.focus();
        }, 3000);
    } else if (!isValidEmailAddress(user.val())) {
        jInfo('E-mail inv&aacute;lido, verifique por favor.', 'Identifica&ccedil;&atilde;o do cliente');
        $('#usr-login').addClass('error');
        setTimeout(function () {
            kill();
            $('#usr-login').focus();
        }, 3000);
    } else {
        $.ajax({
            type: 'POST',
            url: '/Library/Ajax/Login.aspx',
            async: false,
            cache: false,
            data: { acao: 1, login: user.val(), senha: pass.val(), returnpage: "/Default.aspx" },
            dataType: "text",
            beforeSend: function () {
                jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Fazendo login, aguarde...</h3>", "Identifica&ccedil;&atilde;o do cliente");
            },
            success: function (login) {
                login = $.evalJSON(login);
                if (login.logado) {
                    var nomusr = 'visitante!';
                    try {
                        nomusr = $.cookie('NomUsr').split('&')[0].split('=')[1].toString().split(' ')[0];
                    }
                    catch (e) {
                        nomusr = $.cookie('NomUsr');
                    }
                    $("#user_name, #mobile-user_name").html(nomusr);
                    if (login.returnpage.length > 0) {
                        jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Redirecionando, aguarde...</h3>", "Identifica&ccedil;&atilde;o do cliente");
                        window.location.href = login.returnpage;
                    }
                    else {
                        jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Redirecionando, aguarde...</h3>", "Identifica&ccedil;&atilde;o do cliente");
                        if (window.location.pathname == '/Login.aspx' || window.location.pathname == '/CadastroUsuario.aspx') {
                            window.location.href = window.urlnavegacaoloja + '/Default.aspx';
                        } else {
                            window.location.reload();
                        }
                    }
                    $(".mobile-login").hide();
                } else {
                    jAlert('Falha ao autenticar, tente novamente.', 'Login');
                    setTimeout(function () { kill(); user.focus(); }, 3000);
                }
            },
            error: function (txt) {
                error($.evalJSON(txt.responseText).message);
                setTimeout(kill, 3000);
            }
        });
    }
}
function error(message) {
    jAlert('Ocorreu um erro inesperado. Por favor, aguarde alguns minutos e acesse o sistema novamente.<br /><br />Obrigado. <br><br><a href="javascript:void(0);" onclick="$.alerts._hide();">Clique aqui para continuar comprando.</a>' + (message != null ? '<br /><br /><strong>' + message + '</strong>' : ''), 'Desculpe');
}

function registerNews(name, mail) {
    mail.removeClass('error');
    name.removeClass('error');
    var valid = true;
    var msg = '';
    var categories = '';

    $('[CodigoCategoria]').each(function () {
        categories = categories + $(this).attr('CodigoCategoria') + '|';
    });

    if (name.val() == '' || name.val() == name.defaultValue) {
        valid = false;
        msg = msg + '* Nome &eacute; requerido.<br />';
        name.addClass('error');
    }
    if (mail.val() == '' || mail.val() == mail.defaultValue) {
        valid = false;
        msg = msg + '* E-mail &eacute; requerido.<br />';
        mail.addClass('error');
    } else {
        if (!isValidEmailAddress(mail.val())) {
            msg = msg + "* E-mail inv&aacute;lido, por favor verifique!<br />";
            valid = false;
            mail.addClass('error');
        }
    }
    if (valid) {
        $.ajax({
            type: 'POST',
            url: '/Library/Ajax/ManterNewsLetter.aspx',
            cache: false,
            data: { acao: true, nome: name.val(), email: mail.val(), sexo: 'M', datanascimento: '01/01/2000', fonecontato: '', cidade: '', categorias: categories, parceiros: false },
            beforeSend: function () {
                jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Processando, aguarde...</h3>", "Newsletter");
            },
            success: function (txt) {
                jInfo('<h2>Obrigado!</h2><br /> Voc&ecirc; assinou o nosso newsletter.<br />' +
                    'Fique atento &agrave;s novidades e promo&ccedil;&otilde;es da nossa loja.<br /> Boas Compras!', 'Sucesso');
                var form = $('form').first().attr('id');
                document.getElementById(form).reset();
                mail.removeClass('error');
                name.removeClass('error');
            },
            error: function () {
                error();
            }
        });
    } else {
        jAlert(msg, 'Favor informar todos os campos.');
    }
}

/*function verifyScroll() {
	var e = $("#go_top");
	var r = ($(window).width() - $("section.newsletter div.content").width()) / 2;
	if (($("footer#antepenult").length > 0 && $("footer#antepenult").visible(true)) || $("header#initial").visible(true))
		e.removeClass("fixed").removeAttr("style");
	else
		e.addClass("fixed").css("right", r + 30);
}*/

function setCookie(name, value, time, domain) {
    $.cookie(name, value, { expires: time, path: '/', domain: domain });
}

//function paymentOrderByCard() {
//	var identificador = 1;
//	var verificador = "";
//	if ($('[name=idtcodseg]:checked').length > 0) identificador = $($('[name=idtcodseg]:checked').get(0)).val();
//	if ($('#CCV2').val().length > 0) verificador = $('#CCV2').val();
//	var tipotransacao;
//	tipotransacao = $('#tipotransacao').val(); //1 --> Credito a vista; 2 --> Parcelado lojista; A --> Debito

//	$.ajax({
//		type: 'POST',
//		url: '/Library/Ajax/PagamentoCartao.aspx',
//		cache: false,
//		data: { pedidoid: $('#pedidoid').val(), numerocartao: $('#numerocartao').val(), portador: $('#portador').val(), verificador: verificador, identificador: identificador, transacao: tipotransacao, mes: $('#datavalidade').val().split('/')[0], ano: $('#datavalidade').val().split('/')[1], idioma: "PT", codigomoeda: "986", tipoautorizacao: "2", cpfTitularCrt: $('#cpfTitularCrt').val() },
//		dataType: "text",
//		beforeSend: function () {
//			jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Efetuando o pagamento, aguarde...</h3>", "");
//		},
//		success: function (txt) {
//			var objeto = $.evalJSON(txt);
//			if (objeto.sucesso) {
//				jAlert(objeto.mensagem.toString() + '.', 'Pagamento');
//				setTimeout(function () { window.location.href = '/RetornoTransacao.aspx?pedidoid=' + objeto.pedidoid.toString(); }, 3000);
//			} else {
//				jAlert(objeto.mensagem.toString() + '.', 'Pagamento');
//				setTimeout(function () { window.location.href = '/RetornoTransacao.aspx?pedidoid=' + objeto.pedidoid.toString(); }, 3000);
//			}
//		},
//		error: function () {
//			jAlert('Falha ao tentar realizar o pagamento tente novamente mais tarde.', 'Falha no pagamento');
//			setTimeout(kill, 5000);
//		}
//	});
//}
function paymentOrderByCard() {
    var identificador = 1;
    var verificador = "";
    if ($('[name=idtcodseg]:checked').length > 0) identificador = $($('[name=idtcodseg]:checked').get(0)).val();
    if ($('#CCV2').val().length > 0) verificador = $('#CCV2').val();
    var tipotransacao;
    tipotransacao = $('#tipotransacao').val(); //1 --> Credito a vista; 2 --> Parcelado lojista; A --> Debito

    var url_retorno = window.location.origin + '/RetornoTransacao.aspx?pedidoid=' + $('#pedidoid').val();

    $.ajax({
        type: 'POST',
        url: '/Library/Ajax/IntegracaoGwPlus.aspx',
        cache: false,
        data: { acao: 'pre_reserva', pedido: $('#pedidoid').val(), numero_cartao: $('#numerocartao').val(), portador: $('#portador').val(), cvc2: verificador, indicador_cvc2: identificador, mes: $('#datavalidade').val().split('/')[0], ano: $('#datavalidade').val().split('/')[1], url_retorno: url_retorno },
        dataType: "application/json",
        beforeSend: function () {
            jAlert('Efetuando o pagamento...', 'Pagamento');
        },
        success: function (txt) {
            var objeto = $.evalJSON(txt);
            if (objeto.sucesso) {
                if (objeto.redirecionamento != null) {
                    jAlert('Aguardando autentica&ccedil;&atilde;o no emissor do cart&atilde;o.', 'Redirecionando...');
                    window.location.href = objeto.redirecionamento;
                }
                else {
                    jAlert(objeto.mensagem.toString() + '.', 'Pagamento');
                    setTimeout(function () { window.location.href = '/RetornoTransacao.aspx?pedidoid=' + objeto.pedidoid.toString(); }, 3000);
                }
            } else {
                jAlert(objeto.mensagem.toString() + '.', 'Pagamento');
                setTimeout(function () { window.location.href = '/RetornoTransacao.aspx?pedidoid=' + objeto.pedidoid.toString(); }, 3000);
            }
        },
        error: function () {
            jAlert('Falha ao tentar realizar o pagamento tente novamente mais tarde.', 'Falha no pagamento');
            setTimeout(kill, 5000);
        }
    });
}
function logarAdministrador(email, login, senha) {
    $.ajax({
        type: 'POST',
        url: '/Library/Ajax/Login.aspx',
        cache: false,
        data: { acao: 8, email: email, login: login, password: senha, returnpage: getParameterByName('returnpage') },
        dataType: "text",
        beforeSend: function () {
            jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Processando, aguarde...</h3>", "Login");
        },
        success: function (login) {
            login = $.evalJSON(login);
            if (login.logado) {
                jAlert('Voc&ecirc; est&aacute; autenticado como o usu&aacute;rio: <strong>' + login.nome + "</strong><br>Aguarde enquanto a p&aacute;gina &eacute; redirecionada...", 'Login');

                setTimeout(function () {
                    if (login.returnpage.length > 0) {
                        window.location.href = login.returnpage;
                    } else {
                        window.location.href = '/Default.aspx';
                    }
                }, 5000);
            }
            else {
                jAlert(login.mensagemerro, 'Login');
                setTimeout(function () {
                    $.alerts._hide();
                }, 3000);
            }
        },
        error: function (txt, data) {
            jAlert($($(txt.responseText).find(".erro").get(0)).val(), 'Login');
            setTimeout(function () {
                $.alerts._hide();
            }, 3000);
        }
    });
}

function calcShippingDetail() {
    //console.log("Haa mlk!! Fala tu!");
    var cep = $('#cep_shipping').val().replace('-', '').replace('.', '');
    var prodId = $("#prodId").val();
    var combId = $(".wrapSelectCombinacao").find("select.selectCombinacao").last().find("option:selected").val();

    //if ((container.find(".getColor").length > 0 && container.find(".getColor a").length > 0) || container.find('[data-role="product-variation"]').length > 0) {
    //    if (combId == undefined || combId == -1) {
    //        showAlert('warning', 'Selecione corretente as op��es do produto.', '.product-attributes');
    //        container.find('[data-role="product-variation"]').last().addClass("error");
    //        valid = false;
    //    }
    //}


    if (cep != '') {
        $.ajax({
            url: '/Library/Ajax/Frete.aspx',
            type: 'POST',
            datatype: 'text',
            cache: false,
            data: {
                acao: 1,
                cep: cep,
                cookie: false,
                codmer: prodId,
                Combinacao: combId
            },
            beforeSend: function () {
                $('[data-role="content-shipping"]').html("Carregando...");
            },
            success: function (data) {
                if (data.length > 0) {
                    $('[data-role="content-shipping"]').html("");
                    var number = 0;
                    $(data).each(function (i) {
                        if ($(this).text().toUpperCase().indexOf("SELECIONE") == -1 && $(this).text().trim().length > 0) {
                            number++;
                            $('[data-role="content-shipping"]').append("<strong>" + number + ". " + $(this).text() + "</strong><br>");
                        }
                    });
                } else {
                    $('[data-role="content-shipping"]').html('<strong class="red">N&atilde;o enviamos para este CEP!</strong>');
                }
            },
            error: function (data) {
                $('[data-role="content-shipping"]').html('<strong class="red">Falha ao verificar as formas de envio!</strong>');
            }
        });
    } else {
        $('[data-role="content-shipping"]').html('<strong class="red">Informe um CEP v&aacute;lido!</strong>');
    }
}

function quickView(data) {
    var link = data.link;
    var produto = data.produto;
    var fotos = data.fotos;
    var avaliacoes = data.avaliacoes;
    var estrelas = data.quantidadeEstrelas;
    var preco = data.preco;
    var precoboleto = data.precoboleto;
    var maiorformapagamento = data.maiorformapagamento;
    var valorparcelado = data.valorparcelado;
    var combinacoes = data.combinacoes;
    var descricaocombinacao = "";
    if (produto.Combinacao != null && produto.Combinacao.OpcaoAtributo.Descricao.toUpperCase() != "UNICO") {
        descricaocombinacao = " - " + produto.Combinacao.OpcaoAtributo.Descricao;
    }

    var html = "<div class='quick_view'><div class='product_image'>" +
        "<div class='wrap'>";
    if (fotos[0] != undefined && fotos[0].fotoDetalhe != undefined && fotos[0].fotoMiniatura) {
        html += "<img src='" + (fotos[0].fotoDetalhe.DescricaoFoto != "" ? fotos[0].fotoDetalhe.DescricaoFoto : "/App_Themes/ekasa/images/not-found.jpg") + "' alt='" + produto.Nome + "' title='" + produto.Nome + "' class='photo image' width='390' onerror='this.src=\"/App_Themes/ekasa/images/not-found.jpg\"' />";
    }
    html += "</div><div class='thumbnails'><a href='javascript:void(0)' class='prev' title='Anterior'>Anterior</a><a href='javascript:void(0)' class='next' title='Pr&oacute;xima'>Pr&oacute;xima</a><div class='list'>";
    for (var i = 0; i <= fotos.length - 1; i++) {
        if (fotos[i] != undefined && fotos[i].fotoDetalhe != undefined && fotos[i].fotoMiniatura) {
            html += "<a href='" + (fotos[i].fotoDetalhe.DescricaoFoto != "" ? fotos[i].fotoDetalhe.DescricaoFoto : "/App_Themes/ekasa/images/not-found.jpg") + "'><img alt='" + produto.Nome + "' title='Foto " + i + " de " + fotos.length + "' src='" + (fotos[i].fotoMiniatura.DescricaoFoto != "" ? fotos[i].fotoMiniatura.DescricaoFoto : "/App_Themes/ekasa/images/not-found.jpg") + "' width='70' onerror='this.src=\"/App_Themes/ekasa/images/not-found.jpg\"' /></a>";
        }
    }
    html += "</div></div></div>" +
        "<div class='product_description'>" +
        "<h1 class='product_name'>" + produto.Nome + descricaocombinacao + "</h1> <span class='product_code'>(cod. <span itemprop='sku'>" + produto.CodigoReferencia + "</span>)</span><div class='clearfix'></div>" +
        "<div class='stars flt_left'>";
    var avaliacaoDescricao = ["P&eacute;ssimo", "Ruim", "Bom", "&Oacute;timo", "Excelente"];
    for (var i = 1; i <= 5; i++) {
        estrelas = estrelas - 1;
        html += "<a href='javascript:void(0)' " + (estrelas > 0 ? "class='active'" : "") + " title='" + avaliacaoDescricao[i - 1] + "'>" + i + "</a>";
    }
    html += "</div><div class='amount_reviews'><a href='" + link + "#ProductEvaluation'>" + avaliacoes.length + " avalia" + (avaliacoes.length >= 2 ? "&ccedil;&atilde;es" : "&ccedil;&atilde;o") + "</a>&nbsp;&nbsp;</div><div class='clearfix'></div>";
    html += produto.Descricao;
    html += ("<div class='clearfix'></div><a href='" + link + "#ProductDescription' class='view_description button blue_button gray'>MAIS DETALHES</a><div class='clearfix'></div>");
    if (data.estoque && preco.PrecoAtual > 0) {
        if (preco.PrecoLista > preco.PrecoAtual) {
            html += "<div class='flt_left'>De <span class='line-through'>R$ " + preco.PrecoLista.toFixed(2).toString().replace(".", ",") + "</span> por</div><div class='clearfix'></div>";
        }
        if (precoboleto > 0) {
            html += "<div class='featured' itemprop='price'>R$" + precoboleto.toFixed(2).toString().replace(".", ",") + "</div><span class='boleto'>&agrave; vista no boleto</span><div class='clearfix'></div>";
        } else {
            html += "<div class='featured' itemprop='price'>R$" + preco.PrecoAtual.toFixed(2).toString().replace(".", ",") + "</div><div class='clearfix'></div>";
        }
        if (maiorformapagamento != null && maiorformapagamento.Quantidadeparcelas > 1) {
            html += "<span class='subdivision'>ou em " + maiorformapagamento.Quantidadeparcelas + " x de R$ " + valorparcelado + " sem juros</span>";
        }
    } else {
        html += "<div class='featured' itemprop='price' style='font-size:14px'>PRODUTO INDISPON&Iacute;VEL</div><div class='clearfix'></div>";
    }
    if (combinacoes.length > 0) {
        html += "<div class='combinations' id='box_variations'>" +
            "<div class='colors " + (combinacoes.length == 1 && combinacoes[0].OpcaoAtributo.Descricao.toUpperCase().indexOf("UNIC") != -1 ? "hidden" : "") + "'>Cores:<div class='clearfix'></div><div class='getColor'>";
        for (var c = 0; c <= combinacoes.length - 1; c++) {
            var opcao = combinacoes[c].OpcaoAtributo;
            html += "<a href='javascript:void(0);' data-id='" + combinacoes[c].Id + "' data-prod='" + produto.Id + "' class='color-item " + (opcao.Descricao.toUpperCase().indexOf("UNIC") != -1 ? "hidden" : "") + " " + (combinacoes[c].Id == produto.CombinacaoId ? "active" : "") + "' title='" + opcao.Descricao + "' style='background-color:" + opcao.ValorSimbolico + "'>" + opcao.Descricao + "</a>";
        }
        html += "</div></div>";
        html += "<div class='clearfix'></div>";
    }
    if (data.estoque && combinacoes.length > 0) {
        html += "<div class='clearfix'></div><a href='javascript:void(0)' class='add_product incCompra button orange_button' data-id='" + produto.Id + "' data-redirect='1' data-home='1'><strong>Compre Agora!</strong> </a>";
    } else if (data.estoque && combinacoes.length == 0) {
        html += "<div class='clearfix'></div><a href='" + link + "' class='add_product incCompra button orange_button'>VER DETALHES</a>";
    } else if (!data.estoque && produto.Combinacao != null) {
        html += '<a href="javascript:void(0)" class="add_product orange_button modal-window indisponible button" id="availability_warn" data-id="' + produto.Id + '" data-combination="' + produto.Combinacao.Id + '" title="Avisar por E-mail quando este produto chegar" data-object="#availability_warn_form" data-title="Avise-me quando dispon&iacute;vel" data-callback="rebuildAvailabilityWarn(' + produto.Id + ',' + produto.Combinacao.Id + ')">AVISE-ME QUANDO CHEGAR</a>';
    } else if (!data.estoque && produto.Combinacao == null) {
        html += '<a href="javascript:void(0)" class="add_product orange_button modal-window indisponible button" id="availability_warn" data-id="' + produto.Id + '" data-combination="0" title="Avisar por E-mail quando este produto chegar" data-object="#availability_warn_form" data-title="Avise-me quando dispon&iacute;vel" data-callback="rebuildAvailabilityWarn(' + produto.Id + ',0)">AVISE-ME QUANDO CHEGAR</a>';
    }
    html += "</div></div>";
    jInfo(html);
    $("#popup_title").remove();
    if ($('div.thumbnails div.list a').length > 0) {
        $('div.thumbnails div.list a').bind('click', function (event) {
            event.preventDefault();
            var elem = $(this);
            var src = elem.attr('href');
            elem.parent().children('a').removeClass('active');
            elem.addClass('active');
            $('.photo.image').attr({ 'src': src });
        }).first().trigger('click');
    }
    $('div.thumbnails').each(function () {
        var obj = $(this);
        if (obj.find('div.list a').length >= 5) {
            var index = 0;
            var start = 0;
            obj.find('div.list a').each(function () {
                index++;
                if (index % 4 == 0) {
                    start = index - 4;
                    obj.find('div.list a').slice(start, index).wrapAll("<div></div>");
                }
            });
            start = start + 4;
            if (start != index) {
                obj.find('div.list a').slice(start, index).wrapAll("<div></div>");
            }
            obj.find("div.list").cycle({
                fx: "scrollHorz",
                speed: 100,
                timeout: 0,
                next: obj.find("a.next").first(),
                prev: obj.find("a.prev").first(),
                after: function (curr, next, opts) {
                    $(next).find("img").trigger("appear");
                }
            });
        } else {
            obj.find("a.next").first().hide();
            obj.find("a.prev").first().hide();
        }
    });
}

function finalizeOrder() {
    var valid = true;
    var msg = false;
    var tipoPagamentoCartao = $("input[name='bandeira']:checked").attr("data-tipo-bandeira");
    var nome_cartao = $("#cardholderName").val().trim();
    var numero_cartao = $("#cardNumber").val().trim();
    var codigo_seguranca = $("#securityCode").val().trim();
    var data_validade = $("#checkout-expirationdate").val().trim();
    var forma_pag_plano = $('input[name="forma-pagamento"]:checked');
    if (tipoPagamentoCartao == 1) {
        if (valid && numero_cartao.length == 0) {
            if (!msg) {
                jAlert("<img src=\"/App_Themes/amvox/images/Attention-32.png\" alt=\"\" style=\"float:left;margin-right:10px\" /> Preencha o n�mero do cart�o para continuar.");
                msg = true;
            }
            valid = false;
        }
        if (valid && nome_cartao.length == 0) {
            if (!msg) {
                jAlert("<img src=\"/App_Themes/amvox/images/Attention-32.png\" alt=\"\" style=\"float:left;margin-right:10px\" /> Preencha o nome impresso no cart�o para continuar.");
                msg = true;
            }
            valid = false;
        }
        if (valid && (data_validade.length != 7)) {
            if (!msg) {
                jAlert("<img src=\"/App_Themes/amvox/images/Attention-32.png\" alt=\"\" style=\"float:left;margin-right:10px\" /> Preencha a data de validade do seu cart�o corretamente no padr�o mm/aaaa para continuar.");
                msg = true;
            }
            valid = false;
        }
        if (valid && codigo_seguranca.length == 0) {
            if (!msg) {
                jAlert("<img src=\"/App_Themes/amvox/images/Attention-32.png\" alt=\"\" style=\"float:left;margin-right:10px\" /> Preencha o c�digo de seguran�a do seu cart�o para continuar.");
                msg = true;
            }
            valid = false;
        }
    }
    if (valid) {
        forma_pag_plano = forma_pag_plano.val();
    }
    var pedidosJson = [];
    pedidosJson.push({ "Identificador": 0, "condicao_pagamento": forma_pag_plano, "valida_forma_envio": true });


    //valid - continua
    if (valid) {
        var complete_name = $("#cardholderName").val().trim();
        var first_name = complete_name.split(" ")[0];
        var last_name = complete_name.split(" ")[complete_name.split(" ").length - 1];
        $.ajax({
            type: 'POST',
            url: '/CarrinhoCompras.aspx',
            data: { FinalizarPedido: "true", Pedidos: JSON.stringify(pedidosJson) },
            dataType: "text",
            success: function (pedidos) {
                pedidos = $.evalJSON(pedidos);
                if (pedidos.length > 0) {
                    $.ajax({
                        type: 'POST',
                        url: '/Library/Ajax/CarrinhoMiniVisao.aspx',
                        data: { acao: 19, Identificador: 0 },
                        dataType: "text",
                        success: function (exclude) {
                            exclude = $.evalJSON(exclude);
                            if (exclude.sucesso) {
                                $.ajax({
                                    type: 'POST',
                                    url: '/Library/Ajax/CarrinhoMiniVisao.aspx',
                                    data: { acao: 19, Identificador: 1 },
                                    dataType: "text",
                                    success: function (exclude1) {
                                        exclude1 = $.evalJSON(exclude1);
                                        if (exclude1.sucesso) {
                                            for (var idx = 0; idx < pedidos.length; idx++) {
                                                var pedidoPedido = pedidos[idx];
                                                if (pedidoPedido.condicao_pagamento == forma_pag_plano) {
                                                    var identificador = 1;
                                                    var verificador = "";
                                                    if ($('#securityCode').val().length > 0)
                                                        verificador = $('#securityCode').val();
                                                    //var tipotransacao = 1; //1 --> Credito a vista; 2 --> Parcelado lojista; A --> Debito
                                                    var url_retorno = window.location.origin + '/RetornoTransacao.aspx?pedidoid=' + pedidoPedido.id;
                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '/Library/Ajax/IntegracaoGwPlus.aspx',
                                                        cache: false,
                                                        data: { acao: 'pre_reserva', pedido: pedidoPedido.id, numero_cartao: $('#cardNumber').val(), portador: $('#cardholderName').val(), cvc2: verificador, indicador_cvc2: identificador, mes: $('#checkout-expirationdate').val().split('/')[0], ano: $('#checkout-expirationdate').val().split('/')[1], url_retorno: url_retorno },
                                                        dataType: "text",
                                                        beforeSend: function () {
                                                            jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" /><br><br><br>Efetuando o pagamento...", "");
                                                        },
                                                        success: function (txt) {
                                                            var objeto = $.evalJSON(txt);
                                                            if (objeto.sucesso) {
                                                                jAlert(objeto.mensagem.toString());
                                                                setTimeout(function () {
                                                                    window.location.href = "/RetornoTransacao.aspx?PedidoId=" + pedidoPedido.id;
                                                                }, 1000);
                                                            } else {
                                                                jAlert("erro: " + objeto.mensagem.toString());
                                                                setTimeout(function () {
                                                                    window.location.href = "/RetornoTransacao.aspx?PedidoId=" + pedidoPedido.id;
                                                                }, 1000);
                                                            }
                                                        },
                                                        error: function () {
                                                            jAlert('Falha ao tentar realizar o pagamento tente novamente mais tarde.', 'Falha no pagamento');
                                                            setTimeout(kill, 5000);
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
                } else {
                    jAlert("Falha ao Finalizar o seu Pedido!");
                }
            },
            error: function (err) {
                error();
            }
        });
    }

}
//ALTERNA OFERTA - MUDA ENTRE AS OFERTAS PRESENTES

function alternaOferta(secao) {
    if (secao == 1) {
        console.log("Secao 1");
        $("#secao-01").show();
        $("#secao-02").hide();
        $("#secao-00").hide();

        $("#aponta-01").addClass("linha-ativada");
        $("#aponta-01").removeClass("linha-desativada");

        $("#aponta-02").removeClass("linha-ativada");
        $("#aponta-02").addClass("linha-desativada");

        $("#aponta-00").removeClass("linha-ativada");
        $("#aponta-00").addClass("linha-desativada");

    }
    else if (secao == 2) {
        $("#secao-01").hide();
        $("#secao-02").show();
        $("#secao-00").hide();

        $("#aponta-01").removeClass("linha-ativada");
        $("#aponta-01").addClass("linha-desativada");

        $("#aponta-02").addClass("linha-ativada");
        $("#aponta-02").removeClass("linha-desativada");

        $("#aponta-00").removeClass("linha-ativada");
        $("#aponta-00").addClass("linha-desativada");
    }
    else if (secao == 0) {
        $("#secao-01").hide();
        $("#secao-02").hide();
        $("#secao-00").show();

        $("#aponta-01").removeClass("linha-ativada");
        $("#aponta-01").addClass("linha-desativada");

        $("#aponta-02").removeClass("linha-ativada");
        $("#aponta-02").addClass("linha-desativada");

        $("#aponta-00").addClass("linha-ativada");
        $("#aponta-00").removeClass("linha-desativada");
    }
}

$("#aponta-01").click(function () {
    alternaOferta(1);
});
$("#aponta-02").click(function () {
    alternaOferta(2);
});
$("#aponta-00").click(function () {
    alternaOferta(0);
});

function alternaDestaque(secao) {
    var numeroElementos = 0;
    var primeiroItem = 1;

    //Conta Numero de elementos e esconde os excedentes de 2
    $(".lista-produtos-similares").each(function (index) {

        if (index < 2) {
            $(this).show();
            $(this).addClass("secao-01");
        }
        else if (index >= 2 && index < 4) {
            if (primeiroItem == 1)
                $(this).addClass("primeiro-item");

            primeiroItem++;

            $(this).hide();
            $(this).addClass("secao-02");
        }
        else if (index >= 4) {
            if (primeiroItem == 3)
                $(this).addClass("primeiro-item")

            primeiroItem++;

            $(this).hide();
            $(this).addClass("secao-03");
        }

        numeroElementos++;
    });

    //Se houver menos de 2, desabilita op��es de ver outros elementos
    if (numeroElementos <= 2) {
        $("#destaque-02").addClass("desabilitado");
        $("#destaque-00").addClass("desabilitado");
    }
    else if (numeroElementos <= 4)
        $("#destaque-00").addClass("desabilitado");

    if (secao == 1) {
        $(".secao-01").show();
        $(".secao-02").hide();
        $(".secao-03").hide();

        $("#destaque-01").addClass("linha-ativada");
        $("#destaque-01").removeClass("linha-desativada");

        $("#destaque-02").removeClass("linha-ativada");
        $("#destaque-02").addClass("linha-desativada");

        $("#destaque-00").removeClass("linha-ativada");
        $("#destaque-00").addClass("linha-desativada");
    }
    else if (secao == 2) {
        if (numeroElementos > 1) {
            $(".secao-01").hide();
            $(".secao-02").show();
            $(".secao-03").hide();

            $("#destaque-01").removeClass("linha-ativada");
            $("#destaque-01").addClass("linha-desativada");

            $("#destaque-02").addClass("linha-ativada");
            $("#destaque-02").removeClass("linha-desativada");

            $("#destaque-00").removeClass("linha-ativada");
            $("#destaque-00").addClass("linha-desativada");
        }
    }
    else if (secao == 3) {
        if (numeroElementos > 3) {
            $(".secao-01").hide();
            $(".secao-02").hide();
            $(".secao-03").show();

            $("#destaque-01").removeClass("linha-ativada");
            $("#destaque-01").addClass("linha-desativada");

            $("#destaque-02").removeClass("linha-ativada");
            $("#destaque-02").addClass("linha-desativada");

            $("#destaque-00").addClass("linha-ativada");
            $("#destaque-00").removeClass("linha-desativada");
        }
    }
}

$("#destaque-01").click(function () {
    alternaDestaque(1);
});
$("#destaque-02").click(function () {
    if (!$(this).hasClass("desabilitado")) {
        alternaDestaque(2);
    }
});
$("#destaque-00").click(function () {
    if (!$(this).hasClass("desabilitado")) {
        alternaDestaque(3);
    }
});
/*
    READY AQUI
*/

$(document).ready(function () {
    $('a[href^="#"]').bind("click", function (e) {
        e.preventDefault();
        $('html,body').animate({ scrollTop: $(this.hash).offset().top - 80 }, 500);
    });

    if ($("input#search_query").length > 0) {
        $("input#search_query").autocomplete({
            source: function (request, response) {
                $.ajax({
                    type: 'GET',
                    url: '/consulta/Autocomplete?q=' + jQuery("input#search_query").val() + "&limit=10",
                    success: function (data) {
                        data = JSON.parse(data.replace(/&quot;/g, '"'));
                        response(data);
                    },
                    error: function (data) { console.warn(data); }
                });
            },
            open: function () {
                $("#search .ui-autocomplete").show();
                $('input#search_query').autocomplete("widget").width(620);
            },
            select: function (event, ui) {
                window.location.href = ui.item.link;
            },
            appendTo: "div#search"
        }).focus(function () {
            if ($("#search .ui-autocomplete li").length > 0) {
                $("#search .ui-autocomplete").show();
            }
        }).blur(function () {
            setTimeout(function () {
                $("#search .ui-autocomplete").hide();
            }, 500);
        }).data("autocomplete")._renderItem = function (ul, item) {
            if (item.disponivel == true) {
                return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append('<a href="' + item.link + '"><img src="' + item.imagem + '" alt="' + item.produto + '" title="' + item.produto + '" width="90" height="90" onError="this.src=\'/App_Themes/amvox/images/not-found.jpg\'"/><span class="block"><span class="product_name">' + (item.produto.length > 70 ? item.produto.substring(0, 70) + "..." : item.produto) + '</span>' + getStarsAutocomplete(item.avaliacao) + '<strong class="price">R$ ' + (item.preco_venda_boleto != null ? item.preco_venda_boleto : item.preco_venda != null ? item.preco_venda : item.preco_minimo) + '</strong>&nbsp;&nbsp;<span class="parcel">ou ' + item.quantidade_parcela + 'x R$ ' + item.valor_parcela + '</span></span></a>')
                    .appendTo(ul);
            }
            else {
                return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append('<a href="' + item.link + '"><img src="' + item.imagem + '" alt="' + item.produto + '" title="' + item.produto + '" width="90" height="90" onError="this.src=\'/App_Themes/amvox/images/not-found.jpg\'"  /><span class="block"><span class="product_name">' + (item.produto.length > 70 ? item.produto.substring(0, 70) + "..." : item.produto) + '</span>' + getStarsAutocomplete(item.avaliacao) + '</span></a>')
                    .appendTo(ul);
            }
        };
    }
    $("input[name=productQuantity]").live("focusout", function (e) {
        productQuantity($(this));
    });
    $("table.table_cart .refresh").live("click", function (e) {
        var el = $(this).parent().children("input[name=productQuantity]");
        if (el != undefined)
            productQuantity(el);
    });
    $('img[data-original]').lazyload();
    jQuery(".cloud-zoom").CloudZoom();
    if ($('div.thumbnails div.list a').length > 0) {
        $('div.thumbnails div.list a').bind('click', function (event) {
            event.preventDefault();
            var elem = $(this);
            var src = elem.attr('href');
            var zoom = elem.attr('data-src');
            var title = elem.children('img').attr('title');
            elem.parent().children('a').removeClass('active');
            elem.addClass('active');
            $('.photo.image').attr({ 'src': src, 'title': title, 'alt': title });
            $('.cloud-zoom').attr('href', zoom).CloudZoom();
        }).first().trigger('click');
        /*SLIDE DE THUMBNAILS*/
        $("div.thumbnails div.list").slick({
            /*vertical: true,*/
            infinite: false,
            slidesToShow: 4,
            slidesToScroll: 1
        });
    }
    /*SLIDE MARCAS*/
    if ($(window).width() > 768) {
        $('div.company_slide_home.detail').each(function () {
            var count = 5;
            var obj = $(this);
            obj.find('div.list.home div.company_slide_home.hidden.hidden_produto').remove();
            if (obj.find('div.list.home div.company_item').length > count) {
                var index = 0;
                var start = 0;
                obj.find('div.list.home div.company_item').each(function () {
                    index++;
                    if (index % count == 0) {
                        start = index - count;
                        obj.find('div.list.home div.company_item').slice(start, index).wrapAll("<div></div>").first().addClass("first");
                    }
                });
                start = start + count;
                if (start != index) {
                    obj.find('div.list.home div.company_item').slice(start, index).wrapAll("<div></div>").first().addClass("first");
                }
                obj.find("div.list.home").cycle({
                    fx: "scrollHorz",
                    speed: 300,
                    timeout: 0,
                    next: obj.find("a.next_company").first(),
                    prev: obj.find("a.prev_company").first(),
                    cleartype: true,
                    cleartypeNoBg: true,
                    after: function (curr, next, opts) {
                        $(next).find("img").trigger("appear");
                    }
                }).touchwipe({
                    wipeLeft: function () { obj.find("div.list.home").cycle('next'); },
                    wipeRight: function () { obj.find("div.list.home").cycle('prev'); },
                    min_move_x: 20,
                    min_move_y: 20,
                    preventDefaultEvents: true
                });
            } else {
                $("div.list.home div.company_item").css("max-width", "198px");
                obj.find("a.next_company").first().hide();
                obj.find("a.prev_company").first().hide();
            }
        });
    } else {
        $('div.company_slide_home.detail').each(function () {
            var obj = $(this);
            obj.find("a.next_company").first().hide();
            obj.find("a.prev_company").first().hide();
        });
    }

    /*slide marcas*/
    $(".company_slide_home").each(function () {
        $(this).find("div.company_item").each(function (i) {
            var width = 265;
            $(this).css("width", width);
            widthItemHome += width;
        });
        widthItemHome = $(this).find("div.company_item").length * 275 + $(this).find("div.company_item").length * 10;
        var aux = ($(window).width() <= 768) ? '!important' : '';
        var resp = widthItemHome + 'px ' + aux;
        $(this).find(".list").attr('style', 'width: ' + resp);
    }).find("img").trigger("appear");

    if ($("#main_banner .list li").length > 1) {
        $("#main_banner .list").cycle({
            fx: "fade",
            speed: 300,
            timeout: 10000,
            pause: 1,
            cleartype: true,
            cleartypeNoBg: true,
            after: function (curr, next, opts) {
                $(next).find("img").trigger("appear");
            },
            pager: "#main_banner .pagination",
            pagerAnchorBuilder: function (idx) {
                return '<a href="javascript:void(0)" title="' + (idx + 1) + '">' + (idx + 1) + '</a>';
            }
        }).touchwipe({
            wipeLeft: function () { $("#main_banner .list").cycle('next'); },
            wipeRight: function () { $("#main_banner .list").cycle('prev'); },
            min_move_x: 20,
            min_move_y: 20,
            preventDefaultEvents: true
        });
    }

    if ($("#main_banner2 .list li").length > 1) {
        $("#main_banner2 .list").cycle({
            fx: "fade",
            speed: 600,
            timeout: 10000,
            pause: 1,
            cleartype: true,
            cleartypeNoBg: true,
            after: function (curr, next, opts) {
                $(next).find("img").trigger("appear");
            }
        }).touchwipe({
            wipeLeft: function () { $("#main_banner2 .list").cycle('next'); },
            wipeRight: function () { $("#main_banner2 .list").cycle('prev'); },
            min_move_x: 20,
            min_move_y: 20,
            preventDefaultEvents: true
        });
    }

	/*if ($(".listOffers .product_item").length > 2) {
		$(".listOffers").cycle({
			fx: "fade",
			speed: 300,
			timeout: 10000,
			pause: 1,
			cleartype: true,
			cleartypeNoBg: true,
			after: function (curr, next, opts) {
				$(next).find(".product_item").trigger("appear");
			},
			pager: ".listOffers .paginationOffers",
			pagerAnchorBuilder: function (idx) {
				return '<a href="javascript:void(0)" title="' + (idx + 1) + '">' + (idx + 1) + '</a>';
			}
		}).touchwipe({
			wipeLeft: function () { $(".listOffers").cycle('next'); },
			wipeRight: function () { $(".listOffers").cycle('prev'); },
			min_move_x: 20,
			min_move_y: 20,
			preventDefaultEvents: true
		});
	}*/


    $("#go_top").bind("click", function (e) {
        e.preventDefault();
        $("html, body").animate({ scrollTop: 0 }, 300);
    });
    //refreshLazyLoad();
    loginCheck();
    atualizaSacolaPopUp();
    rebuildMasks();
    $('#desSenha').pstrength();
    $('.modal-window[data-object][data-title]').live('click', function (event) {
        event.preventDefault();
        var seletor = $(this).attr('data-object');
        var title = $(this).attr('data-title');
        var callback = $(this).attr('data-callback');
        if (seletor.length > 0) {
            console.log($(seletor).html());
            jInfo($(seletor).html(), title, new Function(callback));
        }
        if (title == 'null') {
            $('#popup_title').remove();
        }
    });
    $('.confirm-window[data-text][data-callback]').bind('click', function (event) {
        event.preventDefault();
        var title = $(this).attr('data-title');
        var callback = $(this).attr('data-callback');
        var text = $(this).attr('data-text');
        if (text.length > 0) {
            if (callback.toUpperCase() == "REDIRECT") {
                var target = $(this).attr('href');
                jConfirm(text, title, function (e) {
                    if (e)
                        window.location.href = target;
                });
            } else
                jConfirm(text, title, new Function(callback));
        }
        if (title == undefined) {
            $('#popup_title').remove();
        }
    });
    $('#newsletter_mail_1').bind('keypress', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            registerNews($("#newsletter_name_1"), $(this));
        }
    });
    $('#newsletter_mail_2').bind('keypress', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            registerNews($("#newsletter_name_2"), $(this));
        }
    });
    $('#newsletter_mail_3').bind('keypress', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            registerNews($("#newsletter_name_3"), $(this));
        }
    });

    $('#newsletter_send_1').bind('click', function (event) {
        event.preventDefault();
        registerNews($("#newsletter_name_1"), $("#newsletter_mail_1"));
    });
    $('#newsletter_send_2').bind('click', function (event) {
        event.preventDefault();
        registerNews($("#newsletter_name_2"), $("#newsletter_mail_2"));
    });
    $('#newsletter_send_3').bind('click', function (event) {
        event.preventDefault();
        registerNews($("#newsletter_name_3"), $("#newsletter_mail_3"));
    });
    $('#submit_login').bind('click', function (event) {
        event.preventDefault();
        log($('#usr-login'), $('#usr-pass'));
    });
    $('#login_submit').bind('click', function (event) {
        event.preventDefault();
        log($('#login_username'), $('#login_password'));
    });

    $("#email_cadastro").bind('keypress', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            submitPreRegister();
        }
    });
    $("#usr-login").bind('keypress', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            $('#usr-pass').focus();
        }
    });
    $("#login_username").bind('keypress', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            $('#login_password').focus();
        }
    });
    $("#usr-pass").bind('keypress', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            log($('#usr-login'), $('#usr-pass'));
        }
    });
    $("#login_password").bind('keypress', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            log($('#login_username'), $('#login_password'));
        }
    });
    $("#new_costumer").bind('keypress', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            $('#next_step_registration').trigger('click');
        }
    });
    $("form.changeRegistration #senha").bind('keypress', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            $("form.changeRegistration").submit();
        }
    });
    $('#forgot_password, #forgot_password_header').bind("click", function (event) {
        event.preventDefault();
        var isHeader = $(this).attr('id') == 'forgot_password_header';
        var username = isHeader ? $('#login_username') : $('#usr-login');
        var cpf = '';
        var page = '/';
        if (username.val() == null || username.val() == '') {
            jInfo('Primeiro preencha seu E-mail', 'Recuperar Senha');
            username.addClass('error');
            setTimeout(function () {
                kill();
                username.focus();
            }, 3000);
        } else {
            $.ajax({
                type: 'POST',
                url: '/Library/Ajax/Login.aspx',
                cache: false,
                data: { acao: 4, usuario: username.val(), cpf: cpf, returnpage: page },
                dataType: "text",
                beforeSend: function () {
                    jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Processando, aguarde...</h3>", "Recuperar Senha");
                },
                success: function (login) {
                    login = $.evalJSON(login);
                    kill();
                    if (login.sucesso) {
                        if (login.returnpage.length > 0) {
                            jInfo('Senha enviada para o E-mail <strong>' + username.val() + '</strong>, verifique seu e-mail.', 'Esqueci Minha Senha');
                            setTimeout(kill, 5000);
                        }
                    } else {
                        jInfo('N&atilde;o foi poss&iacute;vel recuperar sua senha,<br>verifique seu e-mail.', 'Recuperar Senha');
                        setTimeout(kill, 5000);
                    }
                },
                error: function (txt) {
                    error($.evalJSON(txt.responseText).message);
                    setTimeout(kill, 6000);
                }
            });
        }
    });
    $("body#person_physical form").validate({
        rules: {
            desEmail: { required: true, email: true },
            desNome: { required: true },
            numCpf: { cpf: true, required: true },
            desSenha: { required: true, minlength: 6, maxlength: 15 },
            desConfirmarSenha: { required: true, equalTo: '#desSenha', minlength: 6, maxlength: 15 },
            numPrefixoCep: { required: true },
            desEndereco: { required: true },
            dtaNascimento: { required: true, dateBR: true },
            numTelRes: { required: false },
            telefoneCelular: { required: true },
            numEndereco: { required: true },
            desBairro: { required: true },
            identidade: { required: true },
            orgaoemissor: { required: true },
            nomCidade: { required: true },
            desReferencia: { required: true },
            identificador: { required: true, maxlength: 25 },
            indSiglaUf: { check_item_dropdown: true },
            indTipoLogradouro: { check_item_dropdown: true }
        },
        messages: {
            desEmail: { required: 'Informe o e-mail.', email: 'E-mail inv&aacute;lido.' },
            desNome: { required: 'Informe o nome.' },
            numCpf: { cpf: 'CPF inv&aacute;lido.', required: 'Informe o CPF.' },
            desSenha: { required: 'Informe a senha.' },
            desConfirmarSenha: { required: 'Confirme a senha.', equalTo: 'Senha n&atilde;o compat&iacute;vel.' },
            numPrefixoCep: { required: 'Informe o cep.' },
            desEndereco: { required: 'Informe o endere&ccedil;o.' },
            dtaNascimento: { required: 'Informe a data de nascimento.', dateBR: 'Informe uma data v&aacute;lida.' },
            numTelRes: { required: 'Informe o telefone residencial.' },
            telefoneCelular: { required: 'Informe o telefone celular.' },
            numEndereco: { required: 'Informe o n&uacute;mero' },
            desBairro: { required: 'Informe o bairro.' },
            identidade: { required: 'Informe a identidade.' },
            orgaoemissor: { required: 'Informe o &oacute;rg&atilde;o emissor.' },
            nomCidade: { required: 'Informe a cidade.' },
            desReferencia: { required: 'Informe a refer&ecirc;ncia.' },
            identificador: { required: 'Informe o identificador/destinat&aacute;rio.' },
            indSiglaUf: { check_item_dropdown: 'Informe o estado.' },
            indTipoLogradouro: { check_item_dropdown: 'Informe o tipo de logradouro.' }
        },
        errorElement: 'label',
        submitHandler: function (form) {
            register(false);
        },
        onfocusin: function (form) {
            return;
        },
        onfocusout: function (form) {
            return;
        },
        onkeyup: function (form) {
            return;
        },
        onclick: function (form) {
            return;
        },
        debug: true,
        ignore: ".ignore, :hidden",
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            if (!validator.numberOfInvalids())
                return;

            $('html, body').animate({
                scrollTop: $(validator.errorList[0].element).offset().top - 120
            }, 500, function () { $(validator.errorList[0].element).focus() });
        }
    });
    $("body#person_legal form").validate({
        rules: {
            desRazaoSocial: { required: true, maxlength: 60 },
            desInscricaoEstadual: { maxlength: 25 },
            desNomeFantasia: { required: true },
            desEmail: { required: true, email: true },
            numCnpj: { cnpj: true, required: true },
            desSenha: { required: true, minlength: 6, maxlength: 15 },
            desConfirmarSenha: { required: true, equalTo: '#desSenha', minlength: 6, maxlength: 15 },
            numPrefixoCep: { required: true },
            desEndereco: { required: true },
            dtaNascimento: { required: true, dateBR: true },
            numTelRes: { required: true },
            telefoneCelular: { required: true },
            numEndereco: { required: true },
            desBairro: { required: true },
            nomCidade: { required: true },
            desReferencia: { required: true },
            identificador: { required: true, maxlength: 25 },
            indSiglaUf: { check_item_dropdown: true },
            indTipoLogradouro: { check_item_dropdown: true }
        },
        messages: {
            desRazaoSocial: { required: 'Informe a Raz&atilde;o Social.' },
            desNomeFantasia: { required: 'Informe o Nome Fantasia' },
            desEmail: { required: 'Informe o e-mail.', email: 'E-mail inv&aacute;lido.' },
            numCnpj: { cnpj: 'CNPJ inv&aacute;lido.', required: 'Informe o CNPJ.' },
            desSenha: { required: 'Informe a senha.' },
            desConfirmarSenha: { required: 'Confirme a senha.', equalTo: 'Senha n&atilde;o compat&iacute;vel.' },
            numPrefixoCep: { required: 'Informe o cep.' },
            desEndereco: { required: 'Informe o endere&ccedil;o.' },
            numTelRes: { required: 'Informe o telefone residencial.' },
            telefoneCelular: { required: 'Informe o telefone celular.' },
            numEndereco: { required: 'Informe o n&uacute;mero' },
            dtaNascimento: { required: 'Informe a data de constitui&ccedil;&atilde;o.', dateBR: 'Informe uma data v&aacute;lida.' },
            desBairro: { required: 'Informe o bairro.' },
            nomCidade: { required: 'Informe a cidade.' },
            desReferencia: { required: 'Informe a refer&ecirc;ncia.' },
            identificador: { required: 'Informe o identificador/destinat&aacute;rio.' },
            indSiglaUf: { check_item_dropdown: 'Informe o estado.' },
            indTipoLogradouro: { check_item_dropdown: 'Informe o tipo de logradouro.' }
        },
        errorElement: 'label',
        submitHandler: function (form) {
            register(true);
        },
        onfocusin: function (form) {
            return;
        },
        onfocusout: function (form) {
            return;
        },
        onkeyup: function (form) {
            return;
        },
        onclick: function (form) {
            return;
        },
        debug: true,
        ignore: ".ignore, :hidden",
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            if (!validator.numberOfInvalids())
                return;

            $('html, body').animate({
                scrollTop: $(validator.errorList[0].element).offset().top - 120
            }, 500, function () { $(validator.errorList[0].element).focus() });
        }
    });
    $("body#change_person_physical form").validate({
        rules: {
            nome: { required: true },
            email: { validateEmail: true, required: true },
            datanascimento: { required: true, dateBR: true },
            cpf: { cpf: true, required: true },
            rg: { required: true },
            orgaoexpeditor: { required: true },
            telefoneNumero: { required: true },
            senha: { required: true }
        },
        messages: {
            nome: { required: 'Informe o nome.' },
            email: { validateEmail: true, required: 'Informe o e-mail.' },
            datanascimento: { required: 'Informe a data', dateBR: 'Informe uma data v&aacute;lida.' },
            cpf: { cpf: 'CPF inv&aacute;lido.', required: 'Informe o CPF.' },
            rg: { required: 'Informe a identidade.' },
            orgaoexpeditor: { required: 'Informe o &oacute;rg&atilde;o emissor.' },
            telefoneNumero: { required: 'Informe o telefone.' },
            senha: { required: 'Informe a senha.' }
        },
        errorElement: 'label',
        submitHandler: function (form) {
            changeRegistration(false);
        },
        onfocusin: function (form) {
            return;
        },
        onfocusout: function (form) {
            return;
        },
        onkeyup: function (form) {
            return;
        },
        onclick: function (form) {
            return;
        },
        debug: true,
        ignore: ".ignore, :hidden",
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            if (!validator.numberOfInvalids())
                return;

            $('html, body').animate({
                scrollTop: $(validator.errorList[0].element).offset().top - 120
            }, 500, function () { $(validator.errorList[0].element).focus() });
        }
    });
    $("body#change_person_legal form").validate({
        rules: {
            razaosocial: { required: true, maxlength: 60 },
            inscricaoestadual: { maxlength: 25 },
            nome: { required: true },
            email: { validateEmail: true, required: true },
            datanascimento: { required: true, dateBR: true },
            cnpj: { cnpj: true, required: true },
            telefoneNumero: { required: true },
            senha: { required: true }
        },
        messages: {
            razaosocial: { required: 'Informe a raz&atilde;o social.' },
            nome: { required: 'Informe o nome.' },
            email: { validateEmail: true, required: 'Informe o e-mail.' },
            datanascimento: { required: 'Informe a data', dateBR: 'Informe uma data v&aacute;lida.' },
            cnpj: { cnpj: 'CPF inv&aacute;lido.', required: 'Informe o CPF.' },
            telefoneNumero: { required: 'Informe o telefone.' },
            senha: { required: 'Informe a senha.' }
        },
        errorElement: 'label',
        submitHandler: function (form) {
            changeRegistration(true);
        },
        onfocusin: function (form) {
            return;
        },
        onfocusout: function (form) {
            return;
        },
        onkeyup: function (form) {
            return;
        },
        onclick: function (form) {
            return;
        },
        debug: true,
        ignore: ".ignore, :hidden",
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            if (!validator.numberOfInvalids())
                return;

            $('html, body').animate({
                scrollTop: $(validator.errorList[0].element).offset().top - 120
            }, 500, function () { $(validator.errorList[0].element).focus() });
        }
    });
    $("form.evaluation").validate({
        rules: {
            comment_title: { required: true },
            comment_text: { required: true, minlength: 50 }
        },
        messages: {
            comment_title: { required: 'Informe o T&iacute;tulo da Avalia&ccedil;&atilde;o.' },
            comment_text: { required: 'Informe sua opini&atilde;o.' }
        },
        errorElement: 'label',
        submitHandler: function (form) {
            rate($('.stars.controller a.selected').attr('data-id'), form.comment_title.value, form.comment_text.value, form.prodId.value, form.usrId.value, form.lojaId.value);
        },
        onfocusin: function (form) {
            return;
        },
        onfocusout: function (form) {
            return;
        },
        onkeyup: function (form) {
            return;
        },
        onclick: function (form) {
            return;
        },
        debug: true,
        ignore: ".ignore, :hidden",
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            if (!validator.numberOfInvalids())
                return;

            $('html, body').animate({
                scrollTop: $(validator.errorList[0].element).offset().top - 120
            }, 500, function () { $(validator.errorList[0].element).focus() });
        }
    });
    $('.calendario').blur(function () {
        var datevalue = $(this).val().split("/");
        if (datevalue.length == 3) {
            var month = parseInt(datevalue[1]);
            if (month > 12) {
                jAlert('Data inv&aacute;lida.');
                $(this).val("");
                return false;
            }
            if (month == 4 || month == 6 || month == 9 || month == 11) {
                if (parseInt(datevalue[0]) > 30) {
                    jAlert('Data inv&aacute;lida.');
                    $(this).val("");
                    return false;
                }
            } else if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
                if (parseInt(datevalue[0]) > 31) {
                    jAlert('Data inv&aacute;lida.');
                    $(this).val("");
                    return false;
                }
            } else if (month == 2) {
                if (parseInt(datevalue[2]) % 4 == 0) {
                    if (parseInt(datevalue[0]) > 29) {
                        jAlert('Data inv&aacute;lida.');
                        $(this).val("");
                        return false;
                    }
                } else {
                    if (parseInt(datevalue[0]) > 28) {
                        jAlert('Data inv&aacute;lida.');
                        $(this).val("");
                        return false;
                    }
                }
            }
        }
        return true;
    });

    $("#user_submit").live("click", function (e) {
        var camposVazios = false;

        if ($('input[id="user_senha"]').val() == "") {
            camposVazios = true;
            $('input[id="user_senha"]').css('border-color', '#c4122f');
        }
        else
            $('input[id="user_senha"]').css('border-color', '');

        if ($('input[id="tel_confirma"]').val() == "") {
            camposVazios = true;
            $('input[id="tel_confirma"]').css('border-color', '#c4122f');
        }
        else
            $('input[id="tel_confirma"]').css('border-color', '');

        if ($('input[id="user_mail"]').val() == "") {
            camposVazios = true;
            $('input[id="user_mail"]').css('border-color', '#c4122f');
        }
        else {
            if (!isValidEmailAddress($('input[id="user_mail"]').val())) {
                camposVazios = true;
                $('input[id="user_mail"]').css('border-color', '#c4122f');
            }
            else
                $('input[id="user_mail"]').css('border-color', '');

        }
        if (!camposVazios) {
            cpf = $('input[type="text"].mask-cpf').val();
            telefone = $('input[id="tel_confirma"]').val();
            email = $('input[id="user_mail"]').val();
            senha = $('input[id="user_senha"]').val();

            $.ajax({
                type: 'POST',
                url: '/Library/Ajax/ValidaCPF.aspx',
                cache: false,
                data: { Cpf: cpf, Telefone: telefone, Email: email, Senha: senha },
                dataType: "text",
                beforeSend: function () {
                    jInfo('Validando dados...', '');
                },
                success: function (mensagem) {
                    alert("to aqui dentro")
                    var objeto = $.evalJSON(mensagem);

                    if (objeto.sucesso) {
                        setTimeout(function () { kill(); window.location.href = '/MinhaConta.aspx'; }, 3000);
                        jAlert(objeto.html);
                    }
                    else {
                        jAlert(objeto.html);
                        $('input[type="text"].mask-cpf').focus();
                    }
                },
                error: function (txt, data) {
                    error();
                }
            });
        }

    });

    $('input[type="text"].mask-cpf').bind('focusout', function () {
        var cpf = $(this).val().replace('.', '').replace('.', '').replace('-', '');
        var cpfmask = $(this).val();

        if (cpf.length == 11) {
            $.ajax({
                type: 'POST',
                url: '/Library/Ajax/ValidaCPF.aspx',
                cache: false,
                data: { Cpf: cpf, Cpfmask: cpfmask },
                dataType: "text",
                beforeSend: function () {
                    jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Validando CPF, aguarde...</h3>", "");
                },
                success: function (mensagem) {
                    var objeto = $.evalJSON(mensagem);

                    if (objeto.cpfjaexiste) {
                        jInfo(objeto.html, '');
                        $('.mask-telefone').setMask({ mask: '(99)999999999', autoTab: false });
                    }
                    else {
                        $.alerts._hide();
                    }
                },
                error: function (txt, data) {
                    error();
                }
            });
        }
    });

    $('input[type="text"].mask-cep.search-cep').bind('focusout', function () {
        var cep = $(this).val().replace('.', '').replace('-', '');
        if (cep.length == 8) {
            $.ajax({
                type: 'POST',
                url: '/Library/Ajax/Cep.aspx',
                cache: false,
                data: { Cep: cep },
                dataType: "text",
                beforeSend: function () {
                    jInfo('<div style="width:300px"><img src="/App_Themes/amvox/images/4.gif" width=\"30\" /><br><h3 style="margin-top:20px;font-family:\'dosismedium\'">Buscando endere&ccedil;o..., aguarde...</h3></div>', "");
                    $("#popup_title").remove();
                },
                success: function (endereco) {
                    if (endereco.length > 0) {
                        endereco = $.evalJSON(endereco);
                        kill();
                        atualizaDadosEndereco(endereco);
                    } else {
                        jInfo('CEP Inv&aacute;lido, tente novamente.', 'Buscar endere&ccedil;o');
                    }
                },
                error: function (txt, data) {
                    error();
                }
            });
        }
    });
    $("*[data-remove]").live("click", function (event) {
        event.preventDefault();
        var ex = $(this).attr("data-remove").split('_')[0];
        var cb = $(this).attr('data-remove').split('_')[1];
        var opcao_id = $(this).attr("data-opcao");
        var capa_id = $(this).attr("data-capa");
        var etapa_id = $(this).attr("data-etapa");
        $.ajax({
            type: 'POST',
            url: '/Library/Ajax/CarrinhoMiniVisao.aspx',
            cache: false,
            async: false,
            data: { acao: "7", id: ex, combinacao: cb },
            dataType: "text",
            beforeSend: function () {
                jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Carregando, aguarde...</h3>", "");
            },
            success: function (compras) {
                if (opcao_id != 0) {
                    localStorage.removeItem("opcao-" + opcao_id + "-0");
                    window.location.href = "/CompraPersonalizada.aspx?id=" + capa_id + "&etapa_id=" + etapa_id;
                } else {
                    window.location.reload();
                }
            },
            error: function (txt, data) {
                error($.evalJSON(txt.responseText).message);
                setTimeout(kill, 3000);
            }
        });
    });
    $('#numCodCupom').bind('keydown', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            $('#btOkCodCupom').trigger('click');
        }
    });
    $("#btOkCodCupom").bind("click", function (event) {
        event.preventDefault();
        if ($('#numCodCupom').val().length > 0) {
            jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Consultando cupom de desconto, aguarde...</h3>", "");
            $.ajax({
                type: 'POST',
                url: '/Library/Ajax/CarrinhoMiniVisao.aspx',
                cache: false,
                data: { acao: "9", chavecupom: $("#numCodCupom").val() },
                dataType: "text",
                success: function (compras) {
                    var objeto = $.evalJSON(compras);
                    if (objeto.sucesso) {
                        jInfo('C&oacute;digo aceito para vale desconto.', "");
                        $('#ValorTotalGeral').html(objeto.ValorTotal);
                        $('#ValorTotalCarrinho').html(objeto.valorsubtotal);
                        $('#ValorFreteSelecionado').html(objeto.valorfrete);
                        $('#DescontoCarrinho').html(objeto.valordesconto);
                        $("#btOkFrete").click();
                        setTimeout(function () { kill(); }, 3000);
                    } else {
                        jInfo(objeto.mensagem);
                        $('#ValorTotalGeral').html(objeto.ValorTotal);
                        $('#ValorFreteSelecionado').html(objeto.valorfrete);
                        $('#DescontoCarrinho').html(objeto.valordesconto);
                        $('#ValorTotalCarrinho').html(objeto.valorsubtotal);
                        setTimeout(function () { kill(); }, 3000);
                    }
                    $("#ValorTotalBoleto").html(compras.ValorTotalBoleto);
                },
                error: function (txt) {
                    jAlert($.evalJSON(txt.responseText).message);
                }
            });
        } else {
            $('#numCodCupom').addClass('error').attr("placeholder", 'Informe o cupom.');
        }
    });
    $("#btOkFrete").bind("click", function () {
        var cep = $("#numCepFrete").val().replace('-', '').replace('.', '');
        if (!isNaN(cep) && cep.length > 0) {
            calculaFrete(cep);
        } else {
            jInfo('CEP Inv&aacute;lido, tente novamente!', 'Calcular Frete');
            setTimeout(function () {
                kill();
                $('#numCepFrete').focus().addClass('error');
            }, 3000);
        }
    });
    $('#numCepFrete').bind('keypress', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            $('#btOkFrete').trigger('click');
        }
    });
    $('#logout, #exchangeAccount, #logout2').bind("click", function (event) {
        event.preventDefault();
        $(this).html('Saindo...');
        var link = $(this).attr('id') == 'exchangeAccount';
        $.ajax({
            type: 'POST',
            url: '/Library/Ajax/Login.aspx',
            cache: false,
            data: { acao: 3, returnpage: getParameterByName('returnpage') },
            dataType: "text",
            beforeSend: function () {
            },
            success: function (login) {
                login = $.evalJSON(login);
                if (!login.logado) {
                    $("header#initial .offline").show();
                    $("header#initial .logged").hide();
                    $("#logout").removeClass("visible");
                    jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Processando, aguarde...</h3>", "Identifica&ccedil;&atilde;o do cliente");
                    window.location.reload();
                }
            },
            error: function (txt) {
                error($.evalJSON(txt.responseText).message);
                $("header#initial .offline").show();
                $("header#initial .logged").hide();
                $("#logout").removeClass("visible");
            }
        });
    });
    $(".compre-agora[data-id]:not(.suggest)").live("click", function (event) {
        event.preventDefault();
        var prodId = $(this).attr('data-id');
        var redirect = $(this).attr('data-redirect');
        if ($(".selectCombinacao[data-ordem='0']").length > 0) {
            if ($(".selectCombinacao[data-ordem='0']").val() != -1) {
                var combinations = new Array();
                var combId = $(".selectCombinacao[data-ordem='0']").val();
                combinations.push({ "combinacao_id": combId, "quantidade": 1 });
                var pack = $.toJSON({ "produto": prodId, "combinacoes": combinations });

                $.ajax({
                    type: 'POST',
                    url: '/Library/Ajax/CarrinhoMiniVisao.aspx',
                    data: { acao: 16, json: pack },
                    dataType: "text",
                    success: function (result) {
                        result = $.evalJSON(result);
                        if (result.sucesso) {
                            if (redirect) {
                                jInfo("<img src=\"/App_Themes/amvox/images/sucess.png\" /><br><br><strong>Produto adicionado ao carrinho com sucesso!</strong><br><br>Processando, aguarde...", "Comprar");
                                setTimeout(function () {
                                    window.location.href = '/CarrinhoCompras.aspx';
                                }, 3000);
                            } else {
                                atualizaSacolaPopUp();

                                setTimeout(function () {
                                    kill();
                                }, 3000);
                            }
                        } else {
                            jAlert('<strong>' + result.mensagem + '</strong>', "Adicionar Produto");
                            setTimeout(kill, 5000);
                        }
                    },
                    error: function (txt, data) {
                        error(txt.responseText.message);
                        setTimeout(kill, 3000);
                    }
                });
            }
        } else {
            var combinations = new Array();
            combinations.push({ "combinacao_id": 0, "quantidade": 1 });
            var pack = $.toJSON({ "produto": prodId, "combinacoes": combinations });

            $.ajax({
                type: 'POST',
                url: '/Library/Ajax/CarrinhoMiniVisao.aspx',
                data: { acao: 16, json: pack },
                dataType: "text",
                beforeSend: function () {
                    jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Carregando, aguarde...</h3>", "Comprar");
                },
                success: function (result) {
                    result = $.evalJSON(result);
                    if (result.sucesso) {
                        if (redirect) {
                            jInfo("<img src=\"/App_Themes/amvox/images/sucess.png\" /><br><br><strong>Produto adicionado ao carrinho com sucesso!</strong><br><br>Processando, aguarde...", "Comprar");
                            setTimeout(function () {
                                window.location.href = '/CarrinhoCompras.aspx';
                            }, 3000);
                        } else {
                            atualizaSacolaPopUp();

                            setTimeout(function () {
                                kill();
                            }, 3000);
                        }
                    } else {
                        jAlert('<strong>' + result.mensagem + '</strong>', "Adicionar Produto");
                        setTimeout(kill, 5000);
                    }
                },
                error: function (e, ex) {
                    jInfo("Falha ao adicionar o produto no carrinho.", "Aten��o");
                }
            });
        }
    });
    $(".add_product[data-id]:not(.suggest)").live("click", function (event) {
        event.preventDefault();
        var prodId = $(this).attr('data-id');
        var redirect = $(this).attr('data-redirect');
        if ($(".selectCombinacao[data-ordem='0']").length > 0) {
            if ($(".selectCombinacao[data-ordem='0']").val() != -1) {
                var combinations = new Array();
                var combId = $(".selectCombinacao[data-ordem='0']").val();
                combinations.push({ "combinacao_id": combId, "quantidade": 1 });
                var pack = $.toJSON({ "produto": prodId, "combinacoes": combinations });

                $.ajax({
                    type: 'POST',
                    url: '/Library/Ajax/CarrinhoMiniVisao.aspx',
                    data: { acao: 16, json: pack },
                    dataType: "text",
                    success: function (result) {
                        result = $.evalJSON(result);
                        if (result.sucesso) {
                            if (redirect) {
                                jInfo("<img src=\"/App_Themes/amvox/images/sucess.png\" /><br><br><strong>Produto adicionado ao carrinho com sucesso!</strong><br><br>Processando, aguarde...", "Comprar");
                                setTimeout(function () {
                                    window.location.href = '/CarrinhoCompras.aspx';
                                }, 3000);
                            } else {
                                atualizaSacolaPopUp();

                                setTimeout(function () {
                                    kill();
                                }, 3000);
                            }
                        } else {
                            jAlert('<strong>' + result.mensagem + '</strong>', "Adicionar Produto");
                            setTimeout(kill, 5000);
                        }
                    },
                    error: function (txt, data) {
                        error(txt.responseText.message);
                        setTimeout(kill, 3000);
                    }
                });
            }
        } else {
            var combinations = new Array();
            combinations.push({ "combinacao_id": 0, "quantidade": 1 });
            var pack = $.toJSON({ "produto": prodId, "combinacoes": combinations });

            $.ajax({
                type: 'POST',
                url: '/Library/Ajax/CarrinhoMiniVisao.aspx',
                data: { acao: 16, json: pack },
                dataType: "text",
                beforeSend: function () {
                    jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Carregando, aguarde...</h3>", "Comprar");
                },
                success: function (result) {
                    result = $.evalJSON(result);
                    if (result.sucesso) {
                        if (redirect) {
                            jInfo("<img src=\"/App_Themes/amvox/images/sucess.png\" /><br><br><strong>Produto adicionado ao carrinho com sucesso!</strong><br><br>Processando, aguarde...", "Comprar");
                            setTimeout(function () {
                                window.location.href = '/CarrinhoCompras.aspx';
                            }, 3000);
                        } else {
                            atualizaSacolaPopUp();

                            setTimeout(function () {
                                kill();
                            }, 3000);
                        }
                    } else {
                        jAlert('<strong>' + result.mensagem + '</strong>', "Adicionar Produto");
                        setTimeout(kill, 5000);
                    }
                },
                error: function (e, ex) {
                    jInfo("Falha ao adicionar o produto no carrinho.", "Aten��o");
                }
            });
        }
        //$.ajax({
        //	type: 'POST',
        //	url: '/Library/Ajax/CarrinhoTopo.aspx',
        //	data: { CodMer: prodId, Combinacao: 0 },
        //	dataType: "application/json",
        //	beforeSend: function () {
        //		jInfo('Carregando...', 'Comprar');
        //	},
        //	success: function () {
        //		if (redirect) {
        //			jInfo("<img src=\"/App_Themes/amvox/images/sucess.png\" /><br><br><strong>Produto adicionado ao carrinho com sucesso!</strong><br><br>Processando, aguarde...", "Comprar");
        //			setTimeout(function () {
        //				window.location.href = '/CarrinhoCompras.aspx';
        //			}, 3000);
        //		} else {
        //			atualizaSacolaPopUp();

        //			setTimeout(function () {
        //				kill();
        //			}, 3000);
        //		}
        //	},
        //	error: function (txt, data) {
        //		error(txt.responseText.message);
        //		setTimeout(kill, 3000);
        //	}
        //});
    });
    $(".add_product.suggest").bind("click", function (event) {
        event.preventDefault();
        var CodSugInt = $(this).attr("data-id");
        $.ajax({
            type: 'POST',
            url: '/Library/Ajax/CarrinhoTopo.aspx',
            data: { CodSugInt: CodSugInt },
            dataType: "text",
            beforeSend: function () {
                jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Carregando, aguarde...</h3>", "Comprar");
            },
            success: function (retorno) {
                retorno = $.evalJSON(retorno);
                if (retorno.QuantidadeTotalItens > 0) {
                    jInfo("<img src=\"/App_Themes/amvox/images/sucess.png\" /><br><br><strong>Produtos da Sugest&atilde;o Inteligente adicionados ao carrinho com sucesso!</strong><br><br>Processando, aguarde...", "Comprar");
                    setTimeout(function () {
                        window.location.href = '/CarrinhoCompras.aspx';
                    }, 3000);
                } else {
                    jInfo("<img src=\"/App_Themes/amvox/images/error.png\" /><br><br><strong>Falha ao processar a Sugest&atilde;o Inteligente", "Erro");
                }
            },
            error: function (txt, data) {
                error(txt.responseText.message);
                setTimeout(kill, 3000);
            }
        });
    });
    $("form.contact").validate({
        rules: {
            desNome: { required: true },
            desEmail: { required: true, email: true },
            desTelefone: { required: true },
            desMensagem: { required: true },
            desCanalAtendimento: { check_item_dropdown: true }
        },
        messages: {
            desNome: { required: 'Informe o nome.' },
            desEmail: { required: 'Informe o e-mail.', email: 'E-mail inv&aacute;lido.' },
            desTelefone: { required: 'Informe o telefone.' },
            desMensagem: { required: 'Informe sua mensagem.' },
            desCanalAtendimento: { check_item_dropdown: 'Informe o assunto.' }
        },
        errorElement: 'label',
        submitHandler: function (form) {
            contactSend();
        },
        onfocusin: function (form) {
            return;
        },
        onfocusout: function (form) {
            return;
        },
        onkeyup: function (form) {
            return;
        },
        onclick: function (form) {
            return;
        },
        debug: true,
        ignore: ".ignore, :hidden",
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            if (!validator.numberOfInvalids())
                return;

            $('html, body').animate({
                scrollTop: $(validator.errorList[0].element).offset().top - 120
            }, 500, function () { $(validator.errorList[0].element).focus() });
        }
    });
    $("form.mypassword").validate({
        rules: {
            desSenhaAtual: { required: true },
            desNovaSenha: { required: true, minlength: 6 },
            desConfirmarNovaSenha: { required: true, equalTo: '#desNovaSenha', minlength: 6 }
        },
        messages: {
            desSenhaAtual: { required: 'Informe a senha atual.' },
            desNovaSenha: { required: 'Informe a nova senha.' },
            desConfirmarNovaSenha: { required: 'Informe a confirma&ccedil;&atilde;o da nova senha.', equalTo: 'Confirme a senha.' }
        },
        errorElement: 'label',
        submitHandler: function (form) {
            changepassword();
        },
        onfocusin: function (form) {
            return;
        },
        onfocusout: function (form) {
            return;
        },
        onkeyup: function (form) {
            return;
        },
        onclick: function (form) {
            return;
        },
        debug: true,
        ignore: ".ignore, :hidden",
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            if (!validator.numberOfInvalids())
                return;

            $('html, body').animate({
                scrollTop: $(validator.errorList[0].element).offset().top - 120
            }, 500, function () { $(validator.errorList[0].element).focus() });
        }
    });
    $("#formaenviopagamento").change(function () {
        var forma = $(this).val();

        if (forma > -1 && forma != '') {
            var valor = $(this).children('option:selected').text().split('R$ ')[1].split(' -')[0];
            var nome = $(this).children('option:selected').text().split(' - R$')[0];
            var prazoforma = $(this).children('option:selected').attr('data-time');
            var textoforma = $(this).children('option:selected').attr('data-term');
            $.ajax({
                type: 'POST',
                url: '/Library/Ajax/CarrinhoMiniVisao.aspx',
                cache: false,
                data: { acao: "5", formaenvio: forma, valorfrete: valor, textoforma: textoforma, prazoforma: prazoforma },
                beforeSend: function () {
                    jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><br><h3>Atualizando o valor do frete, aguarde...</h3>", "Formas de Envio");
                },
                success: function () {
                    kill();
                    atualizaSacolaPopUp();
                    $.ajax({
                        type: 'POST',
                        url: '/Library/Ajax/FormaPagamentoPedido.aspx',
                        cache: false,
                        beforeSend: function () {
                            jInfo("<img src=\"/App_Themes/amvox/images/4.gif\" width=\"30\" /><br><br><h3>Atualizando valor da forma de pagamento, aguarde...</h3>", "Formas de Pagamento");
                        },
                        success: function (formapagamento) {
                            $('#formaspagamento').html(formapagamento);

                            $("input[name=bandeira]").first().click();

                            $('*[data-type]').bind('change', function () {
                                $('.setTypeDescription').html($(this).attr('data-description'));
                            });

                            kill();

                            $('.payment-select-address, .flags_payment').removeClass('disabled');
                            $("#dados-cartao-mercadopago").hide();
                            $("#cardholderName, #cardNumber, #securityCode, #cardExpirationMonth").val("");
                            $("#installments option").remove();
                        },
                        error: function () {
                            error();
                        }
                    });

                    if (textoforma == "") {
                        textoforma = "Entrega estimada em " + prazoforma;
                    }

                    $('#EntregaEstimada').html(textoforma);
                    $('#FormaEnvioDescricao').html(nome);
                    $('#ValorFreteSelecionado').html('R$ ' + valor);
                },
                error: function () {
                    error();
                    setTimeout(kill, 3000);
                }
            });
        }
    });
    $("#delivery_options").live("change", function () {
        var value = $(this).val();
        if (value != "-1") {

            var cep = $("#numCepFrete").val().replace('.', '').replace('-', '');
            var price = $(this).children('option:selected').text().split('R$ ')[1].split('-')[0];
            if (price != "") {
                $.ajax({
                    type: 'POST',
                    url: '/Library/Ajax/CarrinhoMiniVisao.aspx',
                    cache: false,
                    data: { acao: "5", formaenvio: value, cep: cep, valorfrete: price },
                    dataType: "text",
                    beforeSend: function () {
                        jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" /><br><br><br><h3>Atualizando valor do frete, aguarde...</h3>", "Formas de Envio");
                    },
                    success: function (compras) {
                        var objeto = $.evalJSON(compras);
                        $('#ValorTotalCarrinho').html(objeto.valorsubtotal);
                        $('#ValorTotalGeral').html(objeto.ValorTotal);
                        $('#ValorFreteSelecionado').html(objeto.valorfrete);
                        $("#ValorTotalBoleto").html(compras.ValorTotalBoleto);
                        kill();
                        if (window.location.href.toLowerCase().indexOf("pagamento.aspx") > -1)
                            cardsHandler();
                    },
                    error: function () {
                        kill();
                        jAlert('Erro ao atualizar o valor do frete.', 'Formas de Envio');
                    }
                });
            }
        }
    });
    $("input[name='bandeira']").live("change", function () {
    	var price = $(this).attr("data-price");
    	var type = $(this).attr("data-type");

    	$.ajax({
    		type: 'POST',
    		url: '/Library/Ajax/FormaPagamentoBandeira.aspx',
    		data: { bandeira: $(this).val(), valor: price, frete: $('#ValorFreteSelecionado').html().replace("R$ ", "") },
    		cache: false,
    		beforeSend: function () {
    			//jInfo("<br><img src=\"/App_Themes/amvox/images/4.gif\" /><br><br><br><h3>Calculando parcelas, aguarde...</h3>", "Formas de Pagamento");
    			//$("#ValorTotalGeral").html(price);
    			//$("#DescontoCarrinho").html("R$ 0,00");
    		},
    		success: function (formapagamento) {
    			kill();
    			if (type == 17) {
    				$(".payment-parcel").hide();
    				$(".payment-parcel .options").html(formapagamento).find("input[value!=-1]").attr('checked', 'checked').trigger("change");
    			} else {
    				//$(".payment-parcel").show();
    				//$(".payment-parcel .options").html(formapagamento + "<div class='clearfix'></div>");
    				//if (formapagamento.indexOf('BANRI') != -1)
    				//	$("div.message_banri").show();
    				//else
    				//	$("div.message_banri").hide();
    			}
    		},
    		error: function () {
    			jAlert('Erro ao calcular as Formas de Pagamento!', 'Formas de Pagamento');
    			setTimeout(kill, 3000);
    		}
    	});
    });
    //$('input[name="forma-pagamento"]').live('change', function () {
    //	var quantidade = $(this).attr('data-count');

    //	if (quantidade > 0) {
    //		$.ajax({
    //			type: 'POST',
    //			url: '/Library/Ajax/CarrinhoMiniVisao.aspx',
    //			cache: false,
    //			data: { acao: "11", formapagamento: $(this).val() },
    //			dataType: "text",
    //			beforeSend: function () {
    //				//jAlert('Atualizando item...','Quantidade de Itens');
    //			},
    //			success: function (compras) {
    //				var objeto = $.evalJSON(compras);
    //				$('#ValorTotalCarrinho').html(objeto.valorsubtotal);
    //				$('#ValorTotalGeral').html(objeto.ValorTotal);
    //				$('#ValorFreteSelecionado').html(objeto.valorfrete);
    //				$('#DescontoCarrinho').html(objeto.valordesconto);
    //				$("#ValorTotalBoleto").html(compras.ValorTotalBoleto);
    //			},
    //			error: function (txt, data) {
    //				jAlert($($(txt.responseText).find(".erro").get(0)).val(), 'Aviso');
    //			}
    //		});
    //		if (quantidade == 1) {
    //			$('.setTypeNumber').html(quantidade + ' parcela');
    //		}
    //		if (quantidade >= 2) {
    //			$('.setTypeNumber').html(quantidade + ' parcelas');
    //		}
    //		if (quantidade == 'Selecione uma forma de pagamento') {
    //			$('.setTypeNumber').html('Selecione a parcela');
    //		}
    //	} else {
    //		$('.setTypeNumber').html(' ');
    //	}
    //});

    $('#search #search_submit').bind('click', function (event) {
        event.preventDefault();
        var defaultValue = document.getElementById("search_query").defaultValue;
        var value = $('input#search_query').val();
        if (defaultValue != value) {
            window.location.href = '/consulta/?q=' + value;
        } else {
            window.location.href = '/consulta/?q=';
        }
    });

    /* adicionado */
    $('#search_submit_2').bind('click', function (event) {
        event.preventDefault();
        var defaultValue = document.getElementById("search_query_2").defaultValue;
        var value = $('input#search_query_2').val();
        if (defaultValue != value) {
            window.location.href = '/consulta/?q=' + value;
        } else {
            window.location.href = '/consulta/?q=';
        }
    });

    $('input#search_query').bind('keydown', function (event) {
        var keyCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
        var defaultValue = this.defaultValue;
        var value = this.value;
        if (keyCode == 13 && defaultValue != value) {
            event.preventDefault();
            window.location.href = '/consulta/?q=' + value;
        }
    });
    var itemCont = 0;
    $('section#main aside div.wrap').each(function () {
        var wrap = $(this);
        $(this).find('h3').each(function (i) {
            itemCont++;
            if (itemCont == 4) {
                $('<a />', { href: 'javascript:void(0)', "class": "more", text: "Veja Mais +" }).bind('click', function (event) {
                    event.preventDefault();

                    if ($(this).hasClass('open')) {
                        $(this).parent().children('.item-extend').hide();
                        $(this).removeClass('open').text('Veja Mais +');
                    } else {
                        $(this).parent().children('.item-extend').show();
                        $(this).addClass('open').text('Veja Menos [-]');
                    }
                }).insertBefore(wrap.find('hr'));
            } else if (itemCont > 4) {
                $(this).addClass('item-extend').hide();
            }
        });
        itemCont = 0;
    });
    $('.stars.controller a').bind("click", function () {
        $($('.stars.controller a').removeClass("active").removeClass("selected").splice(0, $(this).index() + 1)).each(function (i) { $(this).addClass("active"); });
        $(this).addClass("selected");
    });
    $("#search-order").bind("click", function (e) {
        e.preventDefault();
        var el = $("#order-number");
        if (el.val() != "" && el.val().length > 0 && !isNaN(el.val()))
            window.location.href = '/pedido/' + el.val();
        else {
            el.addClass("error");
            jInfo("Por favor, informe o n&uacute;mero do pedido.", "Buscar pedido");
            setTimeout(function () {
                kill();
                el.focus();
            }, 3000);
        }
    });
    $("#order-number").bind('keypress', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            $("#search-order").trigger("click");
        }
    });
    $("form.processapagamento").validate({
        rules: {
            numerocartao: { required: true },
            portador: { required: true },
            cpfTitularCrt: { required: true },
            datavalidade: { required: true }
        },
        messages: {
            numerocartao: { required: 'Preencha este campo, por favor.' },
            portador: { required: 'Preencha este campo, por favor.' },
            cpfTitularCrt: { required: 'Preencha este campo, por favor.' },
            datavalidade: { required: 'Preencha este campo, por favor.' }
        }
        , errorElement: 'label'
        , submitHandler: function (form) {
            paymentOrderByCard();
        },
        onfocusin: function (form) {
            return;
        },
        onfocusout: function (form) {
            return;
        },
        onkeyup: function (form) {
            return;
        },
        onclick: function (form) {
            return;
        }, debug: true
    });
    $("#loginadministrador").bind("click", function () {
        logarAdministrador($('#clienteemail').val(), $('#adminuser').val(), $('#adminpassword').val());
    });

    $('#shipping_detail').live('click', function () {
        calcShippingDetail();
    });

    $("#cep_shipping").live('keypress', function (event) {
        if (checkKeyCode(event) == 13) {
            event.preventDefault();
            calcShippingDetail();
        }
    });

    var floatingWidth = $("#floating_cart").width() + 30;

    jQuery(window).bind('scroll', function () {
        if ($("#verify_floating").length > 0 && $(window).width() > 768) {
            var box = $("#verify_floating").offset().top;
            var floating = $("#floating_cart");

            var h = $(window).scrollTop();
            if (h > box && ($(document).scrollTop() < $('#rodape').offset().top - 350)) {
                floating.addClass("fixed");
                floating.css("width", floatingWidth);
            } else {
                floating.removeClass("fixed").removeAttr("style");
            }
        }

        if (window.location.pathname == "/") {
            if ($(document).scrollTop() > 600 && $(window).width() > 1150) {
                $("header#initial:not(.secured)").addClass("fixed");
                if (!$("header#initial").hasClass("secured"))
                    $("section#main").addClass("fixed");
            } else {
                $("header#initial:not(.secured)").removeClass("fixed");
                if (!$("header#initial").hasClass("secured"))
                    $("section#main").removeClass("fixed");
            }
        } else {
            if ($(document).scrollTop() > 210 && $(window).width() > 1150) {
                $("header#initial:not(.secured)").addClass("fixed");
                if (!$("header#initial").hasClass("secured"))
                    $("section#main").addClass("fixed");
            } else {
                $("header#initial:not(.secured)").removeClass("fixed");
                if (!$("header#initial").hasClass("secured"))
                    $("section#main").removeClass("fixed");
            }
        }

    });

    //if ($.cookie('modalnews') == null) {
    //	$("#dialog, #mask").show();
    //	$.cookie('modalnews', '1', { path: '/', domain: '.amvox.com.br' });
    //}

    $("#confirm_address").bind("click", function (e) {
        e.preventDefault();
        $(this).hide();
        $(".payment-select-address").removeClass("disabled");
    });

    $('#submit-pre-register').bind('click', submitPreRegister);

    $(".selectCombinacao").live("change", function () {
        var el = this;
        var combination = $(el).val();

        if (combination != -1) {
            if ($(el).attr("data-ordem") == "0") {
                $.ajax({
                    type: 'POST',
                    url: '/Library/Ajax/FormaPagamentoProduto.aspx',
                    cache: false,
                    data: { produtoid: $("#prodId").val(), combinacaoid: combination },
                    beforeSend: function () {
                        if ($(el).attr("data-precoatributo") == "S") {
                            $("#payment .price, .main_product div.wrap_content, #floating_cart").html("Carregando...");
                        }
                    },
                    success: function (compras) {
                        if ($(el).attr("data-precoatributo") == "S") {
                            if ($(compras).find("#indisponivel").val() == "1") {
                                $("#floating_cart").hide();
                            } else {
                                $("#floating_cart").show().html($(compras).find("#floating_cart").html());
                            }
                            $(".product_description").html($(compras).find("#bloco-produto").html());
                        }
                        //$(".main_product div.product_description h1.product_name").html($(compras).find("#nome_produto").val())
                        //$(".toggle-disponible").html($(compras).find(".wrap-cols").html());
                        selectCombinacaoEvent(el, false);
                    },
                    error: function (txt, data) {
                        jAlert($($(txt.responseText).find(".erro").get(0)).val(), 'Aviso');
                    }
                });
            } else {
                selectCombinacaoEvent(el, true);
            }
            if ($(el).attr("data-atualizafoto") == "S") {
                findPictureSizeSelected(combination);
            }
        }
    });

    var widthItemHome = 0;
    setTimeout(function () {
        if ($(window).width() <= 768) {
            var height = 0;
            $("div#banner ul.list li").each(function () {
                if (height < $(this).height()) {
                    height = $(this).height();
                }
            });
            $("div#banner ul.list li, div#banner ul.list").css("height", height);

            var widthItemHome = 0;
            $(".responsive-content").each(function () {
                if ($(this).find(".item, .product_item").length > 1) {
                    $(this).find(".item, .product_item").each(function (i) {
                        var width = (($(window).width() + 20) * 70) / 100;
                        $(this).css("width", width);
                        widthItemHome += width;
                    });
                    widthItemHome = widthItemHome + $(this).find(".item, .product_item").length;
                    $(this).css("width", widthItemHome - 2);
                }
            }).find("img").trigger("appear");
        } else {
            jQuery(".cloud-zoom").CloudZoom();
        }
    }, 1000);

    if ($(window).width() > 768) {
        $("#mobile-nav").remove();
        $("#mobile-nav-overlay").remove();
    }

    $("header#initial .toggle").click(function () {
        $("#mobile-nav").toggleClass("open");
        $("#mobile-nav-overlay").show();
    });
    $("#mobile-nav, #mobile-nav-overlay").click(function () {
        $("#mobile-nav").removeClass("open");
        $("#mobile-nav-overlay").hide();
        $('#left_aside').addClass('hidden');
    });
    if ($(window).width() >= 768) {
		/*$(".product_slide_home").each(function () {
			$(this).find("div.product_item").each(function (i) {
				var width = (($(window).width() + 20) * 70) / 100;
				$(this).css("width", width);
				widthItemHome += width;
			});
			widthItemHome = widthItemHome + $(this).find("div.product_item").length * 10;
			$(this).find(".list").attr('style', 'width: ' + widthItemHome + 'px');
		}).find("img").trigger("appear");*/


        //LAN�AMENTOS
        $(".product_slide_home .list").slick({
            infinite: true,
            variableWidth: true,
            slidesToShow: 3,
            slidesToScroll: 1
        });
        $(".sugestoes .col-triple .produtoSugestao .produtos .row").slick({
            infinite: false,
            slidesToShow: 3,
            slidesToScroll: 1
        });
    }

    $("nav.main .categories ul > li").bind("mouseenter", function () {
        var box = $(this).children(".categoriesBox");
        if (box != undefined && box.length > 0) {
            box.css("top", $(this).offset().top - 230);
        }
    });
    //$(".listOffers").slick({
    //	infinite: false,
    //	slidesToShow: 2,
    //	slidesToScroll: 1
    //});
    $("#wrap_similares .products-home .list").slick({
        infinite: false,
        slidesToShow: 2,
        slidesToScroll: 1
    });
    $("#brands").slick({
        infinite: true,
        slidesToShow: 6,
        slidesToScroll: 1
    });
    $("#lista_relacionados .list").slick({
        infinite: false,
        slidesToShow: 2,
        slidesToScroll: 1
    });
    if ($(window).width() <= 768) {
        $("#lista_similares .list").slick({
            infinite: false,
            slidesToShow: 1,
            slidesToScroll: 1
        });
        $(".products-cookie .wrap-list").slick({
            lazyLoad: 'ondemand',
            infinite: false,
            slidesToShow: 1,
            slidesToScroll: 1
        });
        $(".list.mobile-version").slick({
            infinite: false,
            sldesToShow: 1,
            slidesToScroll: 1
        });
        $("header#initial .wrap_user").live("click", function () {
            window.location.href = "/MinhaConta.aspx";
        });
    }
    else {
        //$("#lista_similares .list").slick({
        //    infinite: false,
        //    slidesToShow: 2,
        //    slidesToScroll: 0
        //});
        $(".products-cookie .wrap-list").slick({
            lazyLoad: 'ondemand',
            infinite: false,
            slidesToShow: 3,
            slidesToScroll: 1
        });
    }
    if ($(window).width() <= 768 && document.location.pathname != "/") {
        $(".call-center").hide();
        $(".mobile-newsletter").hide();
    }
    $('#filtrar_Mobile').live('click', function () {
        $('#mobile-nav-overlay').show();
        $('#left_aside').removeClass('hidden');
    });
    $(".product_item .lookMore a, .clientesAmam .product_item:hover .look-more").bind("click", function (e) {
        e.preventDefault();
        var id = $(this).attr("data-id");
        var combinacao = $(this).attr("data-combination");
        var link = $(this).attr("data-link");
        var title = $(this).attr("data-title");
        var classificacao = 2;
        $.ajax({
            type: 'GET',
            url: '/Library/Ajax/AjaxProduto.aspx',
            dataType: "application/json",
            data: { CodMer: id, ClassificacaoAtributo: classificacao, combinacao: combinacao },
            beforeSend: function () {
                jInfo('<div class="loader" style="display:block;height:100px"><span class="message">Carregando...</span></div><br><br><br>', title);
            },
            success: function (data) {
                data = $.evalJSON(data);
                if (data.sucesso) {
                    quickView(data);
                } else {
                    window.location.href = link;
                }
            },
            error: function () {
                error();
                setTimeout(kill, 3000);
            }
        });
    });
    $(".clientesAmam.first .seeMore").live("click", function () {
        $(".clientesAmam.first").find(".link-to-expand:lt(3)").toggleClass("link-to-expand");
        if ($(".clientesAmam.first").find(".link-to-expand:lt(3)").length == 0)
            $(this).hide();
    });
    //$(".ofertasDoDia .seeMore").live("click", function () {
    //    $(".ofertasDoDia").find(".link-to-expand:lt(3)").toggleClass("link-to-expand");
    //    if ($(".ofertasDoDia").find(".link-to-expand:lt(3)").length == 0)
    //        $(this).hide();
    //});
    $(".clientesAmam.last .seeMore").live("click", function () {
        $(".clientesAmam.last").find(".link-to-expand:lt(3)").toggleClass("link-to-expand");
        if ($(".clientesAmam.last").find(".link-to-expand:lt(3)").length == 0)
            $(this).hide();
    });

    //mostra menu ao passar o mouse
    if (window.location.pathname != "/" && window.location.pathname != "/Default.aspx") {
        $("nav.main .categories ul li:first-child").live("hover", function () {
            $("nav.main .categories ul li").removeClass("hidden");
        });

        //Esconde os demais menus laterais ao tirar o mouse

        //$("nav.main .categories ul").mouseleave(function () {
        //    $("nav.main .categories ul li:not(:first-child)").addClass("hidden");
        //}); 
    }
    $("#productUpQt").live('click', function () {

        var atual = $(this).parent().find(".productQuantity");                       //$(".productQuantity").val();

        atual.val(parseInt(atual.val()) + 1);                                                    //$(".productQuantity").val(parseInt(atual) + 1);
        productQuantity($(".productQuantity"));

        setTimeout(function () {
            $("#main .table-cart-1 .table_cart .refresh").click();
        }, 500);

    });
    $("#productDownQt").live('click', function () {
        var atual = $(this).parent().find(".productQuantity");                          //$(".productQuantity").val();

        if (parseInt(atual) - 1 <= 0) {
            $("#main .table-cart-1 .table_cart .remove").click();
        }

        else {
            atual.val(parseInt(atual.val()) - 1);
            productQuantity($(".productQuantity"));
            setTimeout(function () {
                $("#main .table-cart-1 .table_cart .refresh").click();
            }, 500);
        }
    });

    //$("input[name='bandeira']").live("change", function () {
    //    $('.setTypeNumber').html("(Selecione a parcela)");
    //    var description = $(this).attr('data-description').toUpperCase();
    //    var price = $(this).attr("data-price");
    //    var type = $(this).attr("data-type");
    //    $.ajax({
    //        type: 'POST',
    //        url: '/Library/Ajax/FormaPagamentoBandeira.aspx',
    //        data: { bandeira: $(this).val(), valor: price, frete: $('#ValorFreteSelecionado').html().replace("R$ ", "") },
    //        cache: false,
    //        beforeSend: function () {
    //            jAlert('Calculando parcelas...', 'Formas de Pagamento');
    //            $("#ValorTotalGeral").html(price);
    //            $("#DescontoCarrinho").html("R$ 0,00");
    //        },
    //        success: function (formapagamento) {
    //            kill();
    //            if (type == "1" || type == 7) {
    //                $("#dados-cartao-mercadopago").hide();
    //                $(".payment-parcel").hide();
    //                $(".payment-parcel .options").html(formapagamento).find("input[value!=-1]").attr('checked', 'checked').trigger("change");
    //            } else {
    //                $("#dados-cartao-mercadopago").show();
    //                $(".payment-parcel").show();
    //                $(".payment-parcel .options").html(formapagamento + "<div class='clearfix'></div>");
    //                if (description.indexOf('BANRI') != -1)
    //                    $("div.message_banri").show();
    //                else
    //                    $("div.message_banri").hide();
    //            }
    //        },
    //        error: function () {
    //            jAlert('Erro ao calcular as Formas de Pagamento!', 'Formas de Pagamento');
    //            setTimeout(kill, 3000);
    //        }
    //    });
    //});




    //$("input[name='bandeira']").live("change", function () {
    //    $('.setTypeNumber').html("(Selecione a parcela)");
    //    var description = $(this).attr('data-description').toUpperCase();
    //    var tipoPagamentoMP = $(this).attr("data-tipo-bandeira");

    //    if (tipoPagamentoMP == 1) {
    //        $("#dados-cartao-mercadopago").show();
    //    } else {
    //        $("#dados-cartao-mercadopago").hide();

    //        if (tipoPagamentoMP == "ticket") {
    //            $(".setTypeNumber").text("1 parcela");
    //        }
    //    }

    //    $(".setTypeDescription").text(description);

    //    $("#cardholderName, #cardNumber, #securityCode, #cardExpirationMonth").val("");
    //    $("#installments option").remove();
    //});
    $('input[name="forma-pagamento"]').live('change', function () {
        var quantidade = $(this).attr('data-count');

        if (quantidade > 0) {
            $.ajax({
                type: 'POST',
                url: '/Library/Ajax/CarrinhoMiniVisao.aspx',
                cache: false,
                data: { acao: "11", formapagamento: $(this).val() },
                dataType: "text",
                beforeSend: function () {
                    //jAlert('Atualizando item...','Quantidade de Itens');
                },
                success: function (compras) {
                    var objeto = $.evalJSON(compras);
                    $('#ValorTotalCarrinho').html(objeto.valorsubtotal);
                    $('#ValorTotalGeral').html(objeto.ValorTotal);
                    $('#ValorFreteSelecionado').html(objeto.valorfrete);
                    $('#DescontoCarrinho').html(objeto.valordesconto);
                    $("#ValorTotalBoleto").html(compras.ValorTotalBoleto);
                },
                error: function (txt, data) {
                    jAlert($($(txt.responseText).find(".erro").get(0)).val(), 'Aviso');
                }
            });
            if (quantidade == 1) {
                $('.setTypeNumber').html(quantidade + ' parcela');
            }
            if (quantidade >= 2) {
                $('.setTypeNumber').html(quantidade + ' parcelas');
            }
            if (quantidade == 'Selecione uma forma de pagamento') {
                $('.setTypeNumber').html('Selecione a parcela');
            }
        } else {
            $('.setTypeNumber').html(' ');
        }
    });
    //$("#close-purchase").bind("click", function () {
    //    finalizeOrder();
    //});
    //$("#close-purchase-2").bind("click", function () {
    //    finalizeOrder();
    //});

    //if ($("#checkout-expirationdate").length > 0) {
    //    $("#checkout-expirationdate").setMask('99/9999');
    //}
    //if ($("#checkout-cardnumber").length > 0) {
    //    $("#checkout-cardnumber").setMask({ mask: '9999999999999999999', autoTab: false });
    //}
    //if ($("#checkout-securitycode").length > 0) {
    //    $("#checkout-securitycode").setMask({ mask: '9999', autoTab: false });
    //}
    //if ($("#checkout-ownername").length > 0) {
    //    $("#checkout-ownername").bind("focusout", function () {
    //        $(this).val($(this).val().toUpperCase());
    //    });
    //}
    $("#check-finalize").bind("click", function (e) {
        var restrict = $('input[name="food-restriction"]:checked').val() == "1";
        var restrict_items = $("#food-restriction-description").val().trim();
        if (restrict && restrict_items.length <= 2) {
            jAlert("Por favor, preencha sua restri��o alimentar.");
            setTimeout(function () {
                kill();
                $("#food-restriction-description").focus();
            }, 3000);
        } else {
            $("#cart-summary").hide();
            $("#cart-finalization").show();
            $('html,body').animate({ scrollTop: 0 }, 500);
            $("#checkout-nome").focus();
        }
    });
    alternaDestaque(4);

    function contadorCaracteres() {
        var avaliacaoConteudo = document.getElementById("comment_text");
        var falta = document.getElementById("caracteres-faltantes");
        var minCaracteres = document.getElementById("min-caracteres");

        var numCaracteres = avaliacaoConteudo.value.length;
        var caracteresFaltantes = 50 - numCaracteres;

        if (caracteresFaltantes > 0) {
            falta.innerHTML = caracteresFaltantes;
            minCaracteres.classList.remove("hidden");
        }
        else {
            minCaracteres.classList.add("hidden");
        }
    }

    if ($("#comment_text").length) {
        document.getElementById("comment_text").addEventListener("input", function () {
            contadorCaracteres();
        });
    }

    //Caso n�o exista avalia��es o t�tulo Avalia��es n�o � exibido!
    if ($(".evaluations").children().length) {
        $("#ProductEvaluation").show();
        $(".wrap-percentage ").show();
        $("#sem-avaliacoes").hide();
    } else {
        $("#ProductEvaluation").hide();
        $(".wrap-percentage ").hide();
        $("#sem-avaliacoes").show();
    }

    //slide Home
    $("#slideHome").slick({
        arrows: false,
        dots: true,
        fade: true,
        dotsClass: "slick-dots",
        autoplay: true,
        autoplaySpeed: 5000,
    });

    //slide 
    $("#ofertas-dia-home").slick({
        slidesToShow: 2,
        slidesPerRow: 2,
        arrows: false,
        dots: true,
        dotsClass: "slick-dots-ofertas",
        autoplay: true,
        autoplaySpeed: 3000,
    });

    

    $('div.swiper-wrapper').each(function () {
        var obj = $(this);
        var countThumb = $(window).width() > 768 ? 2 : 1;
        if (obj.find('div.swiper-slide-item').length >= countThumb) {
            var index = 0;
            var start = 0;
            obj.find('div.swiper-slide-item').each(function () {
                index++;
                if (index % countThumb == 0) {
                    start = index - countThumb;
                    obj.find('div.swiper-slide-item').slice(start, index).wrapAll("<div class='swiper-slide'></div>");
                }
            });
            start = start + countThumb;
            if (start != index) {
                obj.find('div.swiper-slide-item').slice(start, index).wrapAll("<div class='swiper-slide'></div>");
            }
            var swiper = new Swiper('.swiper-container',
            {
                slidesPerView: 1,
                spaceBetween: 40,
            });
        } else {
            obj.find('div.swiper-slide-item').slice(0, 1).wrapAll("<div class='swiper-slide'></div>");
        }
    });

    //Exibe o parcelamento na tela de detalhe do produto
    $("a#mais-parcelamentos").on("click", function() {
        $("div.bg-parcelamos").fadeIn();
    });

    $("div.bg-parcelamos, a.close-parcelamosmais-parcelamentos").on("click", function() {
        $(this).fadeOut();
    })

    menuResize();
});

//Exibe o parcelamento na tela de detalhe do produto
$(document).on("click","a#mais-parcelamentos", function() {
    $("div.bg-parcelamos").fadeIn();
});

$(document).on("click","div.bg-parcelamos, a.close-parcelamosmais-parcelamentos", function() {
    $(this).fadeOut();
})

var count = 0;
var fontsize = 16;

function menuResize() {
    var itemMenu = $('.individual-links.dropdown > a');
    var sumItemMenu = 0;
    $(itemMenu).each(function () {
        sumItemMenu += parseInt($(this).width());
    });
    count++;
    fontsize = fontsize - 0.1;
    $(itemMenu).css({ 'font-size': fontsize });
    var sumItemMenuAux = 0;
    $(itemMenu).each(function () {
        sumItemMenuAux += parseInt($(this).width());
    });

    sumItemMenu = sumItemMenuAux;
    if (sumItemMenu > 973 && count < 1000) {
        setTimeout(menuResize, 3);
    }
}