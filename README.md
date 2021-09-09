# Overleaf-Image-Helper
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate?hosted_button_id=UPTPRDZGCRPJ8)

## Description
Overleaf currently does allow you to upload images only with their upload button.

The purpose of this project is to provide a convenient way to insert images into Overleaf without menus by just using `ctrl+v`.  
I wrote this as Tampermonkey script for Chrome/Chromium and Firefox. The script will create an asset folder in your project root folder and reference images in as LaTeX figures with captions, which you can directly edit after pasting the image.

## Demo
![demo](paste-from-clipboard.gif)

## Installation

1. Install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=de)
2. Create new userscript or add from the raw user.js here from Github.
3. Customize the appearance of the image on the last lines (line 110+) of the script.
4. For community and self hosted pro editions modify the `@match` at the top of the script.
