(function (global) {

var abc = {};

var homeHtmlUrl = "snippets/welcome.html";
var loginHtmlUrl = "snippets/login.html";
var eventosUsuarioHtmlUrl = "snippets/profile.html";
var signupHtmlUrl = "snippets/signup.html";
var userCreatedHtmlUrl = "snippets/userCreated.html";
var errorHtmlUrl = "snippets/error.html";
var errorLogin = "snippets/errorLogin.html";
var eventosUsuarioUrl = "http://172.24.41.201:5000/eventosUsuario";
var detalleEvento = "snippets/evento_detalle.html";
var eventoLogOut = "http://172.24.41.201:5000/logout";
var errorNoAutorizadoUrl = "snippets/errorNoAutorizado.html";

// Convenience function for inserting innerHTML for 'select'
var insertHtml = function (selector, html) {
  var targetElem = document.querySelector(selector);
  targetElem.innerHTML = html;
};

// Show loading icon inside element identified by 'selector'.
var showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};

var insertProperty = function (string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  string = string
    .replace(new RegExp(propToReplace, "g"), propValue);
  return string;
};

document.addEventListener("DOMContentLoaded", function (event) {

  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    loginHtmlUrl,
    function functionName(responseText) {
      insertHtml("#main-content",responseText);
      document.forms['abcLogIn'].addEventListener('submit', inicioSesionEventListener);
    },
    false);
});

// Cargar vistas de los botones
abc.loadHome = function () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    homeHtmlUrl,
    function functionName(responseText) {
      insertHtml("#main-content",responseText);
    },
    false);
};

abc.loadUserEvents = function () {
  showLoading("#main-content");
  fetch(eventosUsuarioUrl, {
      method: 'GET',
      credentials: 'include'
  }).then((resp) => {
      return resp.json();
  }).then((bodyJson) => {
    mostrarEventosUsuario(bodyJson);
  }).catch((error) => {
    $ajaxUtils.sendGetRequest(
      errorNoAutorizadoUrl,
      function functionName(responseText) {
        insertHtml("#main-content",responseText);
      },
      false);
  });
};

function mostrarEventosUsuario(eventos) {
  $ajaxUtils.sendGetRequest(
    eventosUsuarioHtmlUrl,
    function (eventosUsuarioHtmlUrl) {
      $ajaxUtils.sendGetRequest(
        detalleEvento,
        function (detalleEvento) {
          var detalleEventosHtml =
            buildCategoriesViewHtml(eventos,
                                    eventosUsuarioHtmlUrl,
                                    detalleEvento);
          insertHtml("#main-content", detalleEventosHtml);
        },
        false);
    },
    false);
}

function buildCategoriesViewHtml(categories, categoriesTitleHtml,categoryHtml) {

  var finalHtml = categoriesTitleHtml;

  // Loop over categories
  for (var i = 0; i < categories.length; i++) {
    // Insert category values
    var html = categoryHtml;
    var name = "" + categories[i].nombre;
    var categoria = categories[i].categoria;
    var lugar = categories[i].lugar;
    var direccion = categories[i].direccion;
    var fecha_inicio = categories[i].fecha_inicio;
    var fecha_fin = categories[i].fecha_fin;
    var tipo = categories[i].tipo;

    html = insertProperty(html, "nombre_evento", name);
    html = insertProperty(html, "categoria",categoria);
    html = insertProperty(html, "lugar",lugar);
    html = insertProperty(html, "direccion",direccion);
    html = insertProperty(html, "fecha_inicio",fecha_inicio);
    html = insertProperty(html, "fecha_fin",fecha_fin);
    html = insertProperty(html, "tipo",tipo);

    finalHtml += html;
  }
  return finalHtml;
}

function inicioSesionEventListener(loginEvent) {
      loginEvent.preventDefault();
      // TODO do something here to show user that form is being submitted
      showLoading("#main-content");
      fetch(loginEvent.target.action, {
          method: 'POST',
          body: new URLSearchParams(new FormData(loginEvent.target)), // event.target is the form
          credentials: 'include'
      }).then((resp) => {
          return resp.json(); // or resp.text() or whatever the server sends
      }).then((bodyJson) => {
          if (bodyJson && bodyJson.message) {
            $ajaxUtils.sendGetRequest(
              errorLogin,
              function functionName(responseText) {
                insertHtml("#main-content",responseText);
              },
              false);
          }else if (bodyJson && bodyJson.email) {
            fetch(eventosUsuarioUrl, {
                method: 'GET',
                credentials: 'include'
            }).then((resp) => {
                return resp.json();
            }).then((bodyJson) => {
              mostrarEventosUsuario(bodyJson);
            }).catch((error) => {
              $ajaxUtils.sendGetRequest(
                errorNoAutorizadoUrl,
                function functionName(responseText) {
                  insertHtml("#main-content",responseText);
                },
                false);
            });
          }else{
            $ajaxUtils.sendGetRequest(
              errorLogin,
              function functionName(responseText) {
                insertHtml("#main-content",responseText);
              },
              false);
          }
      }).catch((error) => {
        $ajaxUtils.sendGetRequest(
          errorHtmlUrl,
          function functionName(responseText) {
            insertHtml("#main-content",responseText);
          },
          false);
      });
}

abc.login = function () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    loginHtmlUrl,
    function functionName(responseText) {
      insertHtml("#main-content",responseText);

      document.forms['abcLogIn'].addEventListener('submit', inicioSesionEventListener);
    },
    false);
};

abc.signUp = function () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    signupHtmlUrl,
    function functionName(responseText) {
      insertHtml("#main-content",responseText);

      document.forms['abcSignUp'].addEventListener('submit', (event) => {
          event.preventDefault();
          // TODO do something here to show user that form is being submitted
          showLoading("#main-content");
          fetch(event.target.action, {
              method: 'POST',
              body: new URLSearchParams(new FormData(event.target)) // event.target is the form
          }).then((resp) => {
              return resp.json(); // or resp.text() or whatever the server sends
          }).then((body) => {
              // TODO handle body
              $ajaxUtils.sendGetRequest(
                userCreatedHtmlUrl,
                function functionName(responseText) {
                  insertHtml("#main-content",responseText);
                },
                false)
          }).catch((error) => {
            $ajaxUtils.sendGetRequest(
              errorHtmlUrl,
              function functionName(responseText) {
                insertHtml("#main-content",responseText);
              },
              false);
          });
      });
    },
    false);
};

abc.logout = function () {
  showLoading("#main-content");
  fetch(eventoLogOut, {
      method: 'GET',
      credentials: 'include'
  }).then((resp) => {
      return resp.json(); // or resp.text() or whatever the server sends
  }).then((bodyJson) => {
    fetch(loginHtmlUrl , {
      method: 'GET'
    }).then((resp)=>{
      return resp.text();
    }).then((responseText)=>{
      insertHtml("#main-content",responseText);
      document.forms['abcLogIn'].addEventListener('submit', inicioSesionEventListener);
    });
  }).catch((error) => {
    $ajaxUtils.sendGetRequest(
      errorHtmlUrl,
      function functionName(responseText) {
        insertHtml("#main-content",responseText);
      },
      false);
  });
};

global.$abc = abc;

})(window);
