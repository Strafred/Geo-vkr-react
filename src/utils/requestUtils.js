export const requestStationsXML = () => {
  let xmlHttp;
  if (window.XMLHttpRequest) {
    xmlHttp = new XMLHttpRequest();
  } else {
    xmlHttp = new window.ActiveXObject("Microsoft.XMLHTTP");
  }

  const stationsRequestURL = "http://84.237.89.72:8080/fdsnws/station/1/query?level=station&format=xml";
  xmlHttp.open("GET", stationsRequestURL, false);
  xmlHttp.send()

  return xmlHttp.responseXML;
}

export const getNetworks = () => {
  let stationsXML = requestStationsXML();
  let fdsnContent = stationsXML.getElementsByTagName('FDSNStationXML')[0];
  return fdsnContent.getElementsByTagName('Network');
}
