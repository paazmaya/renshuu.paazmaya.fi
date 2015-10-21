# RENSHUU.PAAZMAYA.COM

> Plan your training journey

[![Dependency Status](https://img.shields.io/versioneye/d/paazmaya/renshuu.paazmaya.fi.svg?style=flat-square)](https://www.versioneye.com/user/projects/526e500a632bac05a2000438)
[![Analytics](https://ga-beacon.appspot.com/UA-2643697-15/renshuu.paazmaya.fi/index?flat)](https://github.com/igrigorik/ga-beacon)

## A training timetable

This code is used to run the site available at [`renshuu.paazmaya.fi`](http://renshuu.paazmaya.fi),
which offers an easy way to build a training timetable within the
Japanese martial arts.

The purpose of this project is to create a site that enables its users
to find and create martial art training sessions at different locations,
and then combine these as a training schedule. It will try to calculate
the time needed to travel in between each training location and finally
allow to print a list of them.

Initially I started to build this in the end of the Summer 2010, once I
had returned from my first training adventure in Japan that took for one
month.

Despite the fact that this project is incomplete, I have done already
another similar trip, for a bit over two months in the Summer 2011.


## Technical logic

* User logs in via OAuth provider
* User searches for available trainings of the selected martial arts in the view area of the map
* User can add new training location with training time table to the map
* User can choose a training session to be added in users list of trainings
* Once user has more than one training session in the list, distance calculation occurs
* User can use export settings to change the static map layout which will be for each location in the printable output


## Screenshots of the login page

Login page with three different icon sets.

![Login page with icons from "Hand Drawn Social"](https://github.com/paazmaya/renshuu.paazmaya.fi/raw/master/source/screenshot-2012-login.hand-drawn-social.jpg)

![Login page with icons from "Hand Drawn Social"](https://github.com/paazmaya/renshuu.paazmaya.fi/raw/master/source/screenshot-2012-login.handycons2.jpg)

![Login page with icons from "Hand Drawn Social"](https://github.com/paazmaya/renshuu.paazmaya.fi/raw/master/source/screenshot-2012-login.social-icons-sketch-black.jpg)


## Code Structure

JavaScript application logic files are all prefixed with `renshuu-`,
of which `main` contains all the settings.

JavaScript libraries that are used in this project are:

* Google Maps v3 (http://code.google.com/apis/maps/documentation/javascript/)
* jQuery 1.9.1 (http://jquery.com)
* jQuery blockUI 2.42 (http://malsup.com/jquery/block/)
* JsRender recent GitHub version (https://github.com/BorisMoore/jsrender)

PHP libraries are:

* minify 2.1.5 (http://code.google.com/p/minify/)
* LightOpenID 2011-08-17 (https://gitorious.org/lightopenid/lightopenid)
* PHPMailer 5.2.1 (https://github.com/PHPMailer/PHPMailer)

## TODO

* Markup *should* be completely valid HTML5 and CSS3 for styling.
* SQL table creation script is only compatible with MySQL...
* Compare Nokia Maps (http://api.maps.nokia.com/) with Google Maps. Is it worth the effort to make them switchable? http://www.developer.nokia.com/Community/Wiki/Converting_Google_Maps_for_JavaScript_to_HERE_Maps
* ~~Backbone.js~~ React.js
* Leaflet
* Bower
* gulp tasks
* Sinatra instead of PHP

## References

* Making AJAX Applications Crawlable (http://code.google.com/web/ajaxcrawling/docs/specification.html)
* Overcoming shebang (#!) without JavaScript (http://www.bigspaceship.com/blog/labs/overcoming-shebang-without-javascript)
* How to detect a Ajax request? `$_SERVER['HTTP_X_REQUESTED_WITH']` (http://codeigniter.com/forums/viewthread/59450/)
* Font-Embedding Icons: This Is a Big Deal (http://somerandomdude.com/articles/design-technology/font-embedding-icons/)
* Google Maps API v3, Per-User Limit is 1.0 requests/second/user

## Contributing

[Please refer to a GitHub blog post on how to create somewhat perfect pull request.](https://github.com/blog/1943-how-to-write-the-perfect-pull-request "How to write the perfect pull request")

## License

Available under the [Attribution-NonCommercial-ShareAlike 4.0 International](http://creativecommons.org/licenses/by-nc-sa/4.0/) license.

You are free to:

 * Share — copy and redistribute the material in any medium or format
 * Adapt — remix, transform, and build upon the material

The licensor cannot revoke these freedoms as long as you follow the license terms.




