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
    false); // Explicitely setting the flag to get JSON from server processed into an object literal
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
  $ajaxUtils.sendGetRequest(
    eventosUsuarioUrl,
    mostrarEventosUsuario);
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
          body: new URLSearchParams(new FormData(loginEvent.target)) // event.target is the form
      }).then((resp) => {
          return resp.json(); // or resp.text() or whatever the server sends
      }).then((bodyJson) => {
          // TODO handle body
          if (bodyJson.length > 0) {
            for (var element of bodyJson) {
              if (element.message) { // Hubo un error en la autenticacion
                $ajaxUtils.sendGetRequest(
                  errorLogin,
                  function functionName(responseText) {
                    insertHtml("#main-content",responseText);
                  },
                  false);
              }else {
                $ajaxUtils.sendGetRequest(eventosUsuarioUrl,mostrarEventosUsuario);
              }
            }
          }else {
              if (bodyJson && bodyJson.message) {
                $ajaxUtils.sendGetRequest(
                  errorLogin,
                  function functionName(responseText) {
                    insertHtml("#main-content",responseText);
                  },
                  false);
              }else if (bodyJson && bodyJson.email) {
                $ajaxUtils.sendGetRequest(eventosUsuarioUrl,mostrarEventosUsuario);
              }else{
                $ajaxUtils.sendGetRequest(
                  errorLogin,
                  function functionName(responseText) {
                    insertHtml("#main-content",responseText);
                  },
                  false);
              }
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
              false)
          });
      });
    },
    false);
};

// abc.logout = function () {
//   showLoading("#main-content");
//   $ajaxUtils.sendGetRequest(
//     allCategoriesUrl,
//     buildAndShowCategoriesHTML);
// };

global.$abc = abc;

})(window);
