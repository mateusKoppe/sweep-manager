(function () {
  "use strick";

  angular.module("app", [
    "ngMaterial",
    "ngMessages",
    "ngAnimate",
    "ui.router",
    "app.user",
    "app.class",
  ])
    .value("variables", {
      urlApi: "http://localhost:8800",
    });
}());
