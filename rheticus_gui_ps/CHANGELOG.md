
---
# [4.5.10] - 2023-02-09

## Added

## Changed
 
## Fixed
 - fix bower angular-file-saver dependency (https://github.com/alferov/angular-file-saver/issues/48)

## Removed

---
# [4.5.9] - 2023-02-09

## Added

## Changed
 
## Fixed
 - fix identify on IFFI layers

## Removed

---
# [4.5.8] - 2023-02-06

## Added

## Changed
 
## Fixed
 - restored (previously fixed) ISPRA IFFi url (sinacloud.isprambiente.it) and layers name (IFFI_DGPV=2, IFFI_Aree_frane_diffuse=3, IFFI_Frane=4, IFFI_Frane_Lineari=5, IFFI_Punto_identificativo_frana=6)

## Removed


# [4.5.7] - 2022-03-15
---

## Changed
- integrate planet widget

# [4.5.6] - 2022-02-28
---

## Changed
- sidenav gui fix

# [4.5.5] - 2022-02-11
---

## Changed
- Update bower componets

# [4.5.4] - 2022-02-10
---

## Changed
- Bug fix


# [4.5.3] - 2022-01-27
---

## Added
- Add single bookmark scatterer monitor
- Add group bookmark scatterer monitor
- Add fixed sidenav menu

## Changed
- Change openlayer version to 2.1.0

## Fixed
- Fix 3580-RHETICUS | DISPLACEMENT | O&M 2021 | Layer ps e service layer

# [4.5.2] - 2021-10-20
---

## Added
- Satellites read from database instead of being hardcoded

# [4.5.1] - 2021-10-19
---

## Changed
- Remove satellite feature

# [4.5.0] - 2021-10-18
---
## Added
- Add corner reflector

## Changed
- Satellites read from database instead of being hardcoded
- 3628-RHETICUS | DISPLACEMENT | O&M 2021 | GUI: migliorie e bugfix segnalate dal partner Waterleak

## Fixed
- Fix scatterers search by code
- Fix 3625-RHETICUS | DISPLACEMENT | O&M 2021 | Grafico spostamento: testo sovrapposto alla tabella degli scatterer

# [4.4.5] - 2021-08-27
---
## Added
- Add feature to search PS-DS by scatterer code from search bar
- Add feature bookmark scatterer

## Changed

## Fixed
- Fix graph out of scale bug

# [4.4.4] - 2021-02-26
---
## Added

## Changed

## Fixed
- Fix iffi identify

# [4.4.3] - 2021-02-26
---
## Added

## Changed

## Fixed
- Fix iffi servicemap url

## Removed

# [4.4.2] - 2020-12-16
---
## Added

## Changed

## Fixed
- Fix add bookmarks;
- Fix scroll bar in My Areas;
- Fix Areas and Bookmarks update when login/logout.

## Removed

# [4.4.1] - 2020-12-15
---
## Added

## Changed
- build.sh

## Fixed

## Removed

# [4.4.0] - 2020-12-15
---
## Added
- ID-3116: RHETICUS | DISPLACEMENT | GUI |  Ricerca testuale nelle mie aree e bugfix intestazione lista
## Changed
- Change RHETICUS_API url in local profile;
- Add --output-hashing to Dockerfile;
## Fixed

## Removed

# [4.3.4] - 2020-04-06
---
## Added
- ID-2720: RHETICUS DISPLACEMENT | Bookmark utente

## Changed

## Fixed

## Removed

# [4.2.4] - 2020-03-05
---
## Added
- ID-2510: RHETICUS DISPLACEMENT | GUI | Per i dati di pioggia è necessario inserire i credits del servizio "Dark Sky"

## Changed

## Fixed
- Fixato bug relativo alla creazione delle date della pioggia

## Removed

# [4.2.3] - 2020-03-05
---
## Added
- Aggiunto tasto "Share link"

## Changed
- Cambiata label da "Funzionalità aggiuntive" a "Informazioni aggiuntive"

## Fixed
- ID-2719: RHETICUS DISPLACEMENT | GUI | Scala temporale nel grafico delle piogge

## Removed

# [4.2.2] - 2020-03-04
---
## Added
- ID-2696: RHETICUS NETWORK ALERT | Integrazione con Rheticus Displacement

## Changed

## Fixed

## Removed

# [4.2.1] - 2019-09-25
---
## Added

## Changed

## Fixed
- ID-2379: RHETICUS | DISPLACEMENT | GUI | Dato di sfondo WMS di COWI su Gela-Niscemi. Fixed identify (WMS method GetFeatureInfo) due to misalignment in index (WTF)

## Removed

# [4.2.0] - 2019-09-25
---
## Added
- ID-2379: RHETICUS | DISPLACEMENT | GUI | Dato di sfondo WMS di COWI su Gela-Niscemi. Gestito come layer aggiuntivo

## Changed

## Fixed

## Removed

# [4.1.1] - 2019-03-28
---
## Added

## Changed

## Fixed
- Fix Bug 1882: Rheticus GUI PS | filtro: Errore nella gestione dell'orbita dei satelliti

## Removed

# [4.1.0] - 2019-03-15
---
## Added
- Management of crop parameter and ds

## Changed
- Refactor dockerfile, build.sh
- Call to new apirest endpoints
- Adapt views to support new data structures

## Fixed
- Bug 1651
- Minor bugs on ps-trends-controller 

## Removed

# [4.0.6] - 2019-03-06
---
## Added

## Changed
- ID-1819 Change default basemap to HERE map

## Fixed

## Removed

# [4.0.5] - 2018-11-19
---
## Added

## Changed
- ID-1552 Adapt to new ps identifier schema

## Fixed
- ID-1554 Fix marker's bug 

## Removed


# [4.0.4] - 2018-10-09
---
## Added

## Changed

## Fixed
- Delete old localstorage object

## Removed

# [4.0.3] - 2018-10-05
---
## Added

## Changed
- Adapt layers retrieving system to new GS configuration

## Fixed 


# [4.0.2] - 2018-10-04
---
## Added

## Changed

## Fixed 
- Fix initial translation bug


# [4.0.1] - 2018-10-03
---
## Changed
- Change ps-to-kml request

## Fixed 
- Hide marker after closing ps trends window


# [4.0.0] - 2018-10-02
---
## Changed
- Adapt layers retrieving system to new GS configuration


# [4.0.0] - 2018-09-28
---
## Added
- Display amplitude data points

## Changed
- Adapt data model to new REST API
- Change client secret
- Handle organization geoserver credentials

## Fixed 
- Fix marker on map click
