// CONFIGURAÇÃO
const GITHUB_TOKEN = "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";
const GITHUB_USER  = "criativasmarketing-create";
const GITHUB_REPO  = "sistas-indicam";

function onFormSubmit(e) {
  try { publicarJSON(); } catch(err) { Logger.log("Erro: " + err.toString()); }
}

function publicarJSON() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data  = sheet.getDataRange().getValues();
  var sistas = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[1]) continue;

    var nome      = String(row[1]  || "").trim();
    var email     = String(row[2]  || "").trim();
    var tel       = String(row[3]  || "").trim();
    var cidade    = String(row[4]  || "").trim();
    var pais      = String(row[5]  || "").trim();
    var instagram = String(row[6]  || "").trim();
    var turma     = String(row[8]  || "").trim();
    var area      = String(row[9]  || "").trim();
    var servico   = String(row[10] || "").trim();
    var tipoServ  = String(row[11] || "").trim();
    var benefTipo = String(row[12] || "").trim();
    var benefDesc = String(row[13] || "").trim();
    var prazo     = String(row[14] || "").trim();
    var contato   = String(row[15] || "").trim();

    var ig = instagram.replace("@","")
      .replace("https://www.instagram.com/","")
      .replace("https://instagram.com/","")
      .split("/")[0].split(" ")[0].trim();

    var cat = "Outro";
    var al = area.toLowerCase();
    if (al.indexOf("social") > -1 || al.indexOf("marketing") > -1 || al.indexOf("design") > -1) cat = "Marketing";
    else if (al.indexOf("carreira") > -1 || al.indexOf("mentoria") > -1 || al.indexOf("engenheiro") > -1) cat = "Carreira";
    else if (al.indexOf("arquitetura") > -1 || al.indexOf("interior") > -1) cat = "Arquitetura";
    else if (al.indexOf("event") > -1 || al.indexOf("decora") > -1 || al.indexOf("festa") > -1 || al.indexOf("mercado") > -1) cat = "Eventos";
    else if (al.indexOf("astro") > -1 || al.indexOf("tarot") > -1 || al.indexOf("terapia") > -1) cat = "Bem-estar";
    else if (al.indexOf("admin") > -1 || al.indexOf("virtual") > -1 || al.indexOf("financ") > -1 || al.indexOf("assist") > -1) cat = "Administrativo";

    var modo = "Online";
    var ml = tipoServ.toLowerCase();
    if (ml.indexOf("presencial") > -1 && ml.indexOf("online") > -1) modo = "Ambos";
    else if (ml.indexOf("presencial") > -1) modo = "Presencial";
    else if (ml.indexOf("ambos") > -1) modo = "Ambos";

    var ci = email;
    if (contato.toLowerCase().indexOf("whatsapp") > -1) ci = tel;

    sistas.push({
      nome: nome, area: area, servico: servico,
      beneficio: benefTipo || "Beneficio especial",
      desc: benefDesc, prazo: prazo,
      contato: contato, ci: ci, ig: ig, site: "",
      cidade: cidade + (pais ? ", " + pais : ""),
      modo: modo, turma: turma || "Sistas",
      cat: cat
    });
  }

  Logger.log("Sistas: " + sistas.length);

  var jsonStr = JSON.stringify(sistas, null, 2);
  publicarFicheiro("sistas.json", jsonStr);
}

function publicarFicheiro(filename, content) {
  var url = "https://api.github.com/repos/" + GITHUB_USER + "/" + GITHUB_REPO + "/contents/" + filename;
  var headers = { "Authorization": "token " + GITHUB_TOKEN, "Accept": "application/vnd.github.v3+json" };

  var getResp = UrlFetchApp.fetch(url, { method: "GET", headers: headers, muteHttpExceptions: true });
  var sha = "";
  if (getResp.getResponseCode() === 200) {
    sha = JSON.parse(getResp.getContentText()).sha;
  }

  var body = { message: "update sistas.json", content: Utilities.base64Encode(content, Utilities.Charset.UTF_8), sha: sha };
  var putResp = UrlFetchApp.fetch(url, {
    method: "PUT", headers: headers,
    payload: JSON.stringify(body), muteHttpExceptions: true
  });
  Logger.log("GitHub " + filename + ": " + putResp.getResponseCode());
}
