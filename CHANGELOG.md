# Changelog GrasPlan-website

## Versie 1.5.2 2020-10-23
### Added
* Laat bij adviseurs de naam van het bedrijf zien boven de kalender

### Fixed
* Fix om `farm_id` weg te halen uit localStorage bij login, anders problemen met meerdere accounts
* Fix wanneer cattle count niet bekend is

## Versie 1.5.1 2020-10-22
### Fixed 
* De functie `setFarmId` werd niet met await aangeroepen, terwijl dat wel nodig is
* Fix om bemesting toe te voegen
* Laat veldnaam zien bij percelen

## Versie 1.5.0 2020-10-21
### Changed
* De backend is nu bijgewerkt naar de laatste versie van de NMI API

## Versie 1.4.1 2020-10-07
### Fixed
* Adviseurs kunnen nu kalenders zien die graslandvernieuwing bevatten
* Adviseurs zien nu een groene streep op de kalender als weiden 1 dag duurt

## Versie 1.4.0 2020-05-04
### Changed
* Bij de kalender worden de zones nu alfabetisch gesorteerd

## Versie 1.3.2 2020-04-22
### Added
* Een korte uitleg over zones is toegevoegd bij de keuze of zones gebruikt of niet
* Bij het toevoegen van beheermaatregelen is een stuk tekst toegevoegd die vertelt dat deze maatregelen bedoeld zijn de GLB-pilot

## Versie 1.3.1 2020-04-14
### Added
* Bij het toevoegen van een actie is er nu een knop om alle percelen/zones te deselecteren

### Changed
* De mobiele versie van de kalendar laat niet meer een template tabel zien, maar de tekst dat de mobiele versie voor de kalendar nog niet beschikbaar is

### Fixed
* In de kalender verschijnt nu wel een streepje wanneer er 1 dag wordt beweid

## Versie 1.3.0 2020-04-10
### Added
* Als een gebruiker in de kalender klikt op een actie, dan verschijnen er details over die actie in een pop-up
* Als een adviseur klikt op een actie in de kalender van een van zijn klanten dan zijn er details te zien over die actie
* Het is mogelijk om een beheersmaatregel of graslandvernieuwing te verwijderen door de gebruiker
* Bij toevoegen van bemesting wordt nu gecontroleerd of een product is geselecteerd en anders verschijnt er een foutmelding daarover
* Bij toevoegen van bemesting wordt nu gecontroleerd of een hoeveelheid is ingevuld en anders verschijnt er een foutmelding daarover
* Bij toevoegen van een beheersmaatregel wordt nu gecontroleerd of een maatregel is geselecteerd en anders verschijnt er een foutmelding daarover

### Changed
* De foutmeldingen bij het toevoegen van een actie zijn wat netter geformuleerd

### Fixed
* Graslandvernieuwing liet in de kalender een verkeerde datum zien.

## Version 1.2.1 2020-04-03
### Added
* Een stukje tekst is toegevoegd dat GrasPlan mede is gefinancieerd door het EU Landbouwfonds

### Changed
* Bij het toevoegen van een actie staan de datums als default op vandaag
* Bij het toevoegen van een bemesting, is het verplicht een mestproduct aan te geven

### Fixed
* Bij het opsturen van een bemesting ging soms wat fout doordat het data object niet goed werd aangemaakt
* Fix security issue GHSA-7fhm-mqm4-2wp7s
* Fix dat de bij eendaagse actie er voor 2 dagen instond #2

## Version 1.2.0 2020-04-03
GrasPlan website is released open-source :tada: