# Introduction

ItsyUI, the world's most opinionated UI framework to build cross-platform applications.

> The official guide assumes basic level knowledge of HTML, CSS, and JavaScript. If you are totally new to JavaScript development, it might be the best to grasp the basics then come back and reading through the guide.

## What is ItsyUI?

ItsyUI is a,

* State Management library, it is simple and scalable.
* Opinionated framework of sorts.
* Set of rich UI components specifically designed for metadata driven UI.
* Packged with readymade features targeting web, ios, android and pwa apps.

## Future-Proof Architecture

ItsyUI has generally 3 high-level layers,

1. Shell Widgets - Written in pure ReactJS + Finite State Machines (FSM with xstate), and defines the behavior of a widget.
2. UI Widgets - The UI layer forms the way a widget is rendered on screen and only deals with UI and Styling of the widget.
3. Framework Bindings - Configuration based bindings that allow to define UI flows and its behavior as simple JSON configuration. This allows for reusable configurations, for ex: Invoking a REST API on FORM SUBMIT event.

## Browser and device support

ItsyUI is fully optimized and tested for the following platforms.

Mobile
* iOS 9 and up
* Android 4.4.4 and up with WebView or Chrome browser (Android 4.0 and up with Crosswalk engine)

Desktop

* Latest version of Safari browser
* Latest version of Chrome browser

For other platforms, please be aware that some components or features may not work correctly.

## License

[ItsyUI](https://www.itsyui.com)

Copyright © 2021 ItsyUI. All rights reserved.
