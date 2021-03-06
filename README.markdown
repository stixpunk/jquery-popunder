jquery-popunder
=====

**jquery-popunder** is a jquery-plugin to create popunders in major browsers.

Usage
-----

Popunders are popups which are opened in the background of a browser-window.
This script will only work, if the popunder is opened on a user-generated event (e.g. click or submit).

For examples, take a look at the index.html.

The recommended usage is the 4th example: a function to build the url-stack.
So you leave the event-handling to the plugin. To add some flexibility to the function, the plugin will pass the initial event to the function - from which you may access e.g. DOM-data of the activated DOM-element.

Options
-------
All of the options are optional!.

<pre>
{
    "cookie": "puCookie",       The cookie-name (optional, used for blocking a popunder)
    "name": "puWin",            The window-name (optional)
    "blocktime": false,         The time to block popunder, in minutes
    "window": {
        "height": ..            The width of the popunder
        "width": ..             The height of the popunder
        ..: ..
    },
    "skip": {                   UA-Patterns to skip
        "opera": true
    }
}
</pre>

Compatibility
-------

jquery-popunder was tested with:
- Mozilla Firefox 3-19
- Google Chrome 10-25
  - Note: Currently you can only create 2 popunder in Chrome 22-24
  - Note: In Chrome 23-24 you'll need a separate event for the popunder-effect (@see the examples!)
- Microsoft Internet Explorer 6-9
- Apple Safari 5

Known Issues
-------
- the script does not work with the Opera-Browser, so the opera-browser is disable by default
- the script does not work in Firefox under Gnome
- in Firefox, when the setting: 'Open new windows in a new tab instead' is deactivated

Dependencies
-------
The dependencies can be installed using bower

    bower update

- (optional) jquery - http://www.jquery.com
- (optional) jquery.cookie - https://github.com/carhartl/jquery-cookie

When you're not using jquery, you could use the dist/popunder.min.js, which includes a stripped version of jquery. Mind, that there is no real selector-engine included, which limits element-selection in oldie to #ids.
