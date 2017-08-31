Commitment to Development Index
===============================

This repository is for the 2017 update to the [Center for Global Development's](https://www.cgdev.org) annual [Commitment to Development Index](https://www.cgdev.org/cdi-2015), which ranks 27 of the richest countries on policies affecting those living in poorer countries. The CDI ranks countries on seven components—aid, finance, technology, environment, trade, security, and migration—each of which has several subindicators.

This version of the CDI was first created by [Creative Science](http://creativesci.co/) in 2015. It parses data from an XML file into JavaScript objects and is built on a Backbone.js framework with help from chart.js for rendering drill-down graphs. The 2016 update (by John Osterman) added the ability for users to adjust the weights of the seven components, which by default are weighted equally, and see the effects the adjustments have on the overall scores and rankings.

Other 2016 improvements include better responsiveness for mobile and tablets, more animation to make responses to user input make better sense, more social-sharing opportunities, and better data visualizations.

## 2017 Update

2017 updates by John Osterman improve bar charts by showing the units of the data and displayinghow one country's score compares to the spread and median of all other countries, improve the handling of null data, and better explain inversed indicators, where a lower score is better.