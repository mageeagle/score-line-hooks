# Score Line Hooks

![Image](/images/example.png)

This is a set of abstractions to organize time-based automations in Max/MSP, built using pattrstorage to access parameters in your patcher, connecting these parameters to line/curve objects which automates the change of these parameters. 

This is inspired by the difficulty in managing a time-based composition in Max/MSP, where parameters and their controlling values are easily lost in complex patching, making editing difficult, easy to forget after leaving the patch behind, and very difficult to read as a whole. 

This also tries to encourage modularization of patches, to further segment patches into reusable parts which can be accessed and instantiated easily, and could be used in future patches without rebuilding something from scatch again when you start a new project.

---

### Requires Node4Max and aq-max-utilities and CNMAT Externals

---
## Score Editor
The Score Editor is to collect all these parameters from your subpatcher as a grouped section, and allow you to edit the change in parameters on a function editor, or in line/curve format directly, represented in Parameter/Duration (Normalized) pairs. Each section's starting time and duration relative to the score itself can be individually changed.

Refer to the Example on how to use.

### JSON
The "Score" is in dict/json format, and hence it could be exported and saved, and could be edited with a JSON editor of your choice. A JSON Schema is included for use if you like to edit the score on a JSON editor instead.

---
## Score Reader
The Score can then be played back by the Score Reader, which you could flexible change the duration and the starting point of the score playback, due to the nature of normalized durations saved in the score. The reader sends line/curve formatted messages to their respective named receive objects. You may simply use a receive object and a line object and it would just work.

Refer to the Example on how to use.

---
## Hook Snippets

### Hook Template
This is the starting point of creating a patcher to integrate with the system. Paste the snippet and add your instrument/effect in it. Name the patcher and save it. 

### Hook Pattr
Paste this snippet in an existing patcher and make changes.

For the use of these two snippets please refer to the example.

### Hook Helper
Use this to access commonly accessed stuff in your integrated patcher

> bpatcher hook-helper @args [custom name]-[patcher name]

e.g. if you have a patcher named synth and it's custom name is hello, then the args would be hello-synth.

---
## To-Do
### Score to Grasshopper
Sending Line/Curve Data from the score to Grasshopper for graphic design use.

---
## Obsolete
### qlist to score
The old version of Score Reader is based on qlist.
This is an old patch that sends the data on qlist via OSC to Grasshopper on Rhino3D, for creating graphical scores.

### Score Writer
This is an old version of Score Editor. No GUI but it works with Hook Helper

### rf ri rfa ria rfp rip
This is an old version of rp (receive pattr).
They stand for receive float / receive integer.
This can be used to receive line messages (Parameter / Duration Pair).


The a in the end stands for all, it is attached with an mc.target 0, for mc objects.


rfp rip is used for old version of Hooks, which is here in case it breaks my older patchers
