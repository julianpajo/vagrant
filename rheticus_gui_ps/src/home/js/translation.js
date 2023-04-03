var currentLanguage;
var languagesJson={
  "en-US": {
    "translation": {
      "navHome"     : "Home",
      "navServices" :"Services",
      "navContact"  :"Contacts",
      "welcomeTextSecondary":"Monitoring the evolution of our Earth",
      "servicesText" :"Services",
      "servicesTextDisplacement":"Displacement",
      "servicesTextDisplacementDescription":"Detecting and reporting earth’s surface movements, aimed at monitoring landslides, subsidence, and the stability of infrastructures, as buildings, roads and railways.",
      "servicesTextMarine":"Marine",
      "servicesTextMarineDescription":"Monitoring coastal seawaters quality, supporting local governments, environmental reporting <br>requirements, aquaculture and desalination plants.",
      "servicesTextBurned":"Wildfires",
      "servicesTextBurnedDescription":"A geoinformation service designed to support burnt areas detection and monitoring, through burned area perimeter, mapping and detection of illegal land use changes over time.",
      "servicesTextUrban":"Urban Dynamics",
      "servicesTextUrbanDescription":"Monitoring and reporting land use changes, soil loss and infrastructures development, to support decision makers in territorial planning and infrastructures building.",
      "contactText":"Contacts",
      "contactAddress":"Planetek Italia website",
      "terms":"Terms&Conditions",
      "distributorsList_Head_text":"Worldwide distributors",
      "distributorsList_Par01_text":"The distribution of Rheticus® services is global. Thanks to our valued Authorized Distributors, you will be able to ask information and receive assistance anywhere near your region.",
      "distributorsList_Par02_text":"Rheticus® services are standardized and ready to assist you in solving problems anywhere in our world. We know, anyway, that there is always a question to answer and a specific need to be satisfied. This is why, Planetek Italia is building a group of expert Authorized Distributors, which operates close to your geographic area.",
      "distributorsList_Table_Col01_text":"Rheticus Authorized Distributor",
      "distributorsList_Table_Col02_text":"Geographic Area",
      "america":"America",
      "distributor_geosolutionconsulting":"Central America",
      "africa":"Africa",
      "africa_south":"South Africa",
      "asia":"Asia",
      "distributor_iies":"Kuwait",
      "europe":"Europe",
      "distributor_imagemnl":"BENELUX (Belgium, The Netherlands, Luxembourg)",
      "distributor_gjeovjosa":"Albania",
      "distributor_wizipisi":"Poland",
      "distributor_kaliopa":"Slovenia",
      "distributor_geodatadesign":"South Africa, Ghana, Guinea, Mali and Tanzania"

    }
  },
  "it": {
    "translation": {
      "navHome"     : "Home",
      "navServices" :"Servizi",
      "navContact"  :"Contatti",
      "welcomeTextSecondary":"Monitoring the evolution of our Earth",
      "servicesText" :"Servizi",
      "servicesTextDisplacement":"Displacement",
      "servicesTextDisplacementDescription":"Monitoraggio dei movimenti superficiali connessi a frane, subsidenza e stabilità di edifici ed infrastrutture, come strade, ferrovie, condotte e opere ingegneristiche.",
      "servicesTextMarine":"Marine",
      "servicesTextMarineDescription":"Monitoraggio della qualità delle acque marino-costiere a supporto delle attività di reporting ambientale dei governi locali, dell'acquacoltura e degli impianti di dissalazione.",
      "servicesTextBurned":"Wildfires",
      "servicesTextBurnedDescription":"Monitoraggio delle aree percorse dagli incendi, attraverso la mappatura delle aree e la rilevazione dei cambiamenti di uso del suolo illegali nel </br>tempo.",
      "servicesTextUrban":"Urban Dynamics",
      "servicesTextUrbanDescription":"Monitoraggio dei cambiamenti del territorio, perdita di suolo e costruzione di infrastrutture, per attività di pianificazione territoriale ed ingegneria.",
      "contactText":"Contatti",
      "contactAddress":"Planetek Italia website",
      "terms":"Termini e condizioni",
      "distributorsList_Head_text":"Distributori mondiali",
      "distributorsList_Par01_text":"I servizi Rheticus® hanno una distribuzione globale, ma grazie ai nostri Authorized Distributors avrai sempre qualcuno vicino a cui rivolgerti.",
      "distributorsList_Par02_text":"Per poterti seguire in modo più diretto e vicino alle tue necessità, Planetek Italia si avvale di consulenti esperti distribuiti in prossimità della tua area geografica. Di seguito gli Authorized Distributor e le aree geografiche di competenza. Dove non indicato un distributor, contattare Planetek.",
      "distributorsList_Table_Col01_text":"Rheticus Authorized Distributor",
      "distributorsList_Table_Col02_text":"Area geografica",
      "america":"America",
      "distributor_geosolutionconsulting":"America Centrale",
      "africa":"Africa",
      "africa_south":"Sud Africa",
      "asia":"Asia",
      "distributor_iies":"Kuwait",
      "europe":"Europa",
      "distributor_imagemnl":"BENELUX (Belgio, Olanda, Lussemburgo)",
      "distributor_gjeovjosa":"Albania",
      "distributor_wizipisi":"Polonia",
      "distributor_kaliopa":"Slovenia",
      "distributor_geodatadesign":"Sud Africa, Ghana, Guinea, Mali e Tanzania"

    }
  }
};

// On document loaded set browser language.
$(document).ready(function() {

  var userLang = navigator.language || navigator.browserLanguage;

  if(userLang.indexOf("it")<0){
    userLang="en-US";
    document.getElementById("imageLanguage").src="./media/img/it.png"
    document.getElementById("imageLanguage").title="Click to change language"
  }else{
    document.getElementById("imageLanguage").src="./media/img/gb.png"
    document.getElementById("imageLanguage").title="Clicca per cambiare lingua"
  }
  currentLanguage=userLang;
  //translation i18next
  updateLanguage();

});

//switch language between en-US and it
var changeLanguage = function() {
  if(currentLanguage=="en-US"){
    document.getElementById("imageLanguage").src="./media/img/gb.png";
    document.getElementById("imageLanguage").title="Clicca per cambiare lingua"
    currentLanguage="it";
  }else{
    document.getElementById("imageLanguage").src="./media/img/it.png";
    document.getElementById("imageLanguage").title="Click to change language"
    currentLanguage="en-US";
  }
  updateLanguage();
}


// Update the language with the current language.
var updateLanguage = function(){
  i18next.init({
    lng: currentLanguage,
    resources: languagesJson
  }, function(err, t) {
    // initialized and ready to go!
    document.getElementById("navHome").innerHTML = i18next.t('navHome');
    document.getElementById("navServices").innerHTML = i18next.t('navServices');
    document.getElementById("navContact").innerHTML = i18next.t('navContact');
    document.getElementById("welcomeTextSecondary").innerHTML = i18next.t('welcomeTextSecondary');
    document.getElementById("servicesText").innerHTML = i18next.t('servicesText');
    document.getElementById("servicesTextDisplacement").innerHTML = i18next.t('servicesTextDisplacement');
    document.getElementById("servicesTextDisplacementDescription").innerHTML = i18next.t('servicesTextDisplacementDescription');
    document.getElementById("servicesTextMarine").innerHTML = i18next.t('servicesTextMarine');
    document.getElementById("servicesTextMarineDescription").innerHTML = i18next.t('servicesTextMarineDescription');
    document.getElementById("servicesTextBurned").innerHTML = i18next.t('servicesTextBurned');
    document.getElementById("servicesTextBurnedDescription").innerHTML = i18next.t('servicesTextBurnedDescription');
    document.getElementById("servicesTextUrban").innerHTML = i18next.t('servicesTextUrban');
    document.getElementById("servicesTextUrbanDescription").innerHTML = i18next.t('servicesTextUrbanDescription');
    document.getElementById("contactText").innerHTML = i18next.t('contactText');
    document.getElementById("contactAddress").innerHTML = i18next.t('contactAddress');
    document.getElementById("terms").innerHTML = i18next.t('terms');
    document.getElementById("distributorsList_Head_text").innerHTML = i18next.t('distributorsList_Head_text');
    document.getElementById("distributorsList_Par01_text").innerHTML = i18next.t('distributorsList_Par01_text');
    document.getElementById("distributorsList_Par02_text").innerHTML = i18next.t('distributorsList_Par02_text');
    document.getElementById("distributorsList_Table_Col01_text").innerHTML = i18next.t('distributorsList_Table_Col01_text');
    document.getElementById("distributorsList_Table_Col02_text").innerHTML = i18next.t('distributorsList_Table_Col02_text');
    document.getElementById("america").innerHTML = i18next.t('america');
    document.getElementById("distributor_geosolutionconsulting").innerHTML = i18next.t('distributor_geosolutionconsulting');
    document.getElementById("africa").innerHTML = i18next.t('africa');
    document.getElementById("distributor_geodatadesign").innerHTML = i18next.t('distributor_geodatadesign');
    document.getElementById("asia").innerHTML = i18next.t('asia');
    document.getElementById("distributor_iies").innerHTML = i18next.t('distributor_iies');
    document.getElementById("europe").innerHTML = i18next.t('europe');
    document.getElementById("distributor_imagemnl").innerHTML = i18next.t('distributor_imagemnl');
    document.getElementById("distributor_gjeovjosa").innerHTML = i18next.t('distributor_gjeovjosa');
    document.getElementById("distributor_wizipisi").innerHTML = i18next.t('distributor_wizipisi');
    document.getElementById("distributor_kaliopa").innerHTML = i18next.t('distributor_kaliopa');    
  });
}
