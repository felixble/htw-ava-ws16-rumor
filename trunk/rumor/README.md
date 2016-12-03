
Rumor: Implementierung von Übung 1 in Node (JavaScript)
==========================================================
Felix Blechschmitt

Dieses Dokument enthält Informationen über den Aufbau und die Funktionen von rumor.

# Getting Started

Das Projekt wurde in der Programmiersprache JavaScript nach dem Standard 
[EcmaScript 6 (ES6)](http://www.ecma-international.org/ecma-262/6.0/) entwickelt. Dabei wurde der Interpreter 
 [node](https://nodejs.org/) in der Version v4.4.4 verwendet.

## Installation

Zunächst müssen alle notwendigen Abhängigkeiten installiert werden:
    
    $ npm install
    
## Usage

Zum Übersetzen der Anwendung sowie zum Starten der einzelnen Applikationen werden NPM-Skripte verwendet, die in der
Datei [package.json](./package.json) definiert werden.

Ein solches Skript wird über folgendes Kommando ausgeführt, dabei können optional Parameter übergeben werden:

    $ npm run <SkriptName> [-- <Parameter>]

Des Weiterhen werden zusätzliche Shell-Skripte zur Verfügung gestellt mit denen eine Testsuite zum Durchführen von
 Experimenten gestartet werden kann sowie ein Skript zum sofortigen Beenden aller gestarteter Node-Prozesse. Dieses
 Skript kann im Falle eines Fehlers ausgeführt werden, falls die Prozesse in einem ungewollten Zustand nicht mehr
 normal beendet werden können.
    
### Build-Prozess

Node ist nicht in der Lage JavaScript-Dateien, die im ES6-Standard entwickelt wurden, direkt auszuführen. Diese müssen
zunächst in den [ES5-Standard](http://www.ecma-international.org/ecma-262/5.1/) übersetzt (transpiliert) werden. 
Hierzu wird [babel](https://babeljs.io/) verwendet.

Der Übersetzungsvorgang kann über das NPM-Skript "build" angestoßen werden. Dabei wird zunächst das möglicherweise 
bereits vorhandene Verzeichnis "build" geleert bzw. ein solches Verzeichnis erstellt. Anschließend werden alle
JavaScript-Dateien von babel in den Standard ES5 übersetzt und inklusive 
[Source Map](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) im Verzeichnis "build" abgelegt.

    $ npm run build

### Starten eines Netzwerkknotens

Die Hauptanwendung des Projekts ist ein Netzwerkknoten, der Gerüchte -- also Nachrichten -- entgegen nimmt und diese
an seine Nachbarn verteilt. Ein solcher Knoten kann in einem interaktiven Modus gestartet werden, indem keine Parameter
übergeben werden. Dann werden alle benötigten Parameter über einen CLI-Dialog erfragt:

    $ npm run start
    
Alternativ können die notwendigen Parameter direkt beim Start übergeben werden, sodass die Anwendung ohne weitere
Interkation mit dem Nutzer ausgeführt werden kann. Der Parameter "-h" listet alle möglichen Parameter auf:

    $ npm run start -- -h
    Usage: node index.js
    
          --endpointFilename=[ARG]  path to the endpoints file, leave blank to map ids to local ports
      -g, --graphFilename=[ARG]     path to the graph file defining the network node topology
          --id=[ARG]                ID of this endpoint
      -c, --count=[ARG]             number of receives until a rumor will be believed
      -h, --help                    Display this help

So kann zum Beispiel ein Netzwerkknoten mit der ID 5 wie folgt gestartet werden:

    npm run start -- -g config/graph.dot --id 5 --c 2
    
Dieser Knoten ist dann auf localhost:4004 erreichbar. Der Knoten geht von einer Netzwerktopologie wie in der graphviz-Datei
config/graph.dot definiert aus und glaubt ein Gerücht genau dann, wenn er die Nachricht von mindestens 2 Knoten
erhalten hat. Wird keine endpoint-Datei angegeben (wie in diesem Beispiel), so werden die Endpunkte als Lokal angenommen
und der Netzwerkknoten mit der kleinsten ID erhält den Port 4000. Für jeden weiteren Knoten wird die Portnummer
entsprechend hochgezählt. Die minimale Portnummer (default: 4000) kann über die Konstante MIN_PORT im 
[EndpointManager](./src/endpointManager.js) angepasst werden.

### Starten des Init-Tools

Das Init-Tool kann dazu verwendet werden, um Kontrollnachrichten an einzelne Netzwerkknoten zu senden. Auch diese Tool
kann über einen Dialog interaktiv verwendet weden, um verschiedene Kontrollnachrichten abzusetzen.

    $ npm run init
    Enter command: ?
    init: Initialize distribution of a rumor.
    stop: Stop one rumor node
    stop all: Stop all rumor nodes
    exit: Exit this program
    ?: Display this help

Wie in dem vorhergehenden Code-Ausschnitt gezeigt, listet das Kommando "?" eine Übersicht über alle vorhandenen Kommandos
auf.

Alternativ kann auch ein Kommando als Parameter übergeben werden, was dafür sorgt, dass dieses ausgeführt wird und
sich das Programm anschließend direkt beendet. Dies kann hilfreich sein, um Kontrollnachrichten aus einem Skript 
automatisiert abzusetzen. Auch hier kann die Verwendung über den Parameter "-h" angezeigt werden:

    $ npm run init -- -h
    Usage: node init.js
    
      -c, --cmd=[ARG]    Command: "init" | "stop" | "stop all"
          --host=[ARG]   host
          --port=[ARG]   port
      -r, --rumor=[ARG]  the rumor which should be sent
      -h, --help         Display this help

### Generieren eines Graphen

Eine zufällige Netzwerktopologie kann mithilfe des Tools graphgen, das über das Skript "graphgen" ausgeführt werden kann,
erstellt werden. Auch diese Anwendung kann ohne Parameter in einem interaktiven Modus gestartet werden, indem die 
notwendigen Informationen über einen Dialog erfragt werden. Überlicherweise werden jedoch die benötigten Informationen
direkt als Parameter übergeben. Eine Hilfe wird auch hier mit dem Parameter "-h" angefordert.

    $ npm run graphgen -- -h
    Usage: node graphgen.js
    
      -n                    Number of nodes
      -m                    Number of edges
      -f, --filename=[ARG]  Filename
      -h, --help            Display this help
      
Über den Parameter "-f" bzw. "--filename" (Filename) wird der Pfad angegeben, an dem der erzeugte Graph gespeichert
werden soll.

### Beispiel



## Aufbau



## Protokoll


#### Beispiel



# Tests

## Automatisierte Tests


# Experimente

## Beschreibung

## Auswertung




-- ist noch von Markus...

| Nodes | Edges | BelieveCount c | Rumor | InitNode | Believers | Percentage | AvgNodeDeg |
|-------|-------|----------------|-------|----------|-----------|------------|------------|
| 10    | 15    | 2              | a.1   | 1        |           |            |            |
| 10    | 15    | 2              | a.2   | 1        |           |            |            |
| 10    | 15    | 2              | a.3   | 1        |           |            |            |
| 10    | 15    | 3              | b.1   | 1        |           |            |            |
| 10    | 15    | 3              | b.2   | 1        |           |            |            |
| 10    | 15    | 3              | b.3   | 1        |           |            |            |
| 10    | 15    | 6              | c.1   | 1        |           |            |            |
| 10    | 15    | 6              | c.2   | 1        |           |            |            |
| 10    | 15    | 6              | c.3   | 1        |           |            |            |
| 10    | 20    | 3              | d.1   | 1        |           |            |            |
| 10    | 20    | 3              | d.2   | 1        |           |            |            |
| 10    | 20    | 3              | d.3   | 1        |           |            |            |
| 50    | 51    | 5              | e.1   | 1        |           |            |            |
| 50    | 51    | 5              | e.2   | 1        |           |            |            |
| 50    | 51    | 5              | e.3   | 1        |           |            |            |
| 50    | 90    | 5              | f.1   | 1        |           |            |            |
| 50    | 90    | 5              | f.2   | 1        |           |            |            |
| 50    | 90    | 5              | f.3   | 1        |           |            |            |
| 100   | 190   | 5              | g.1   | 1        |           |            |            |
| 100   | 190   | 5              | g.2   | 1        |           |            |            |
| 100   | 190   | 5              | g.3   | 1        |           |            |            |