RENSHUU.PAAZMAYA.COM
====================
Available under http://creativecommons.org/licenses/by-nc-sa/3.0/ license.

A training timetable
---------------------

This code is used to run the site available at renshuu.paazmaya.com, which offers an easy way to build a training timetable within the Japanese martial arts.

The purpose oof this project is to create a site that enables its users to find and create martial art training sessions at different locations, and then combine these as a training schedule.
It will try to calculate the time needed to travel in between each training location and finally allow to print a list of them.

Initially I started to build this in the end of the Summer 2010, once I had returned from my first training adventure in Japan that took for one month.

Despite the fact that this project is incomplete, I have done already another similar trip, for a bit over two months in the Summer 2011.

Technical logic
---------------

* User logs in via OAuth provider
* User searches for available trainings of the selected martial arts in the view area of the map
* User can add new training location with training time table to the map
* User can choose a training session to be added in users list of trainings
* Once user has more than one training session in the list, distance calculation occurs
* User can use export settings to change the static map layout which will be for each location in the printable output


Screenshots
-----------

Login page with three different icon sets.

![Login page with icons from "Hand Drawn Social"](https://github.com/paazmaya/renshuu.paazmaya.com/raw/master/source/screenshot-2012-login.hand-drawn-social.jpg)

![Login page with icons from "Hand Drawn Social"](https://github.com/paazmaya/renshuu.paazmaya.com/raw/master/source/screenshot-2012-login.handycons2.jpg)

![Login page with icons from "Hand Drawn Social"](https://github.com/paazmaya/renshuu.paazmaya.com/raw/master/source/screenshot-2012-login.social-icons-sketch-black.jpg)


Code Structure
--------------

Javascript application logic files are all prefixed with `renshuu-`, of which `main` contains all the settings.

Javascript libraries that are used in this project are:

* Google Maps v3 (http://code.google.com/apis/maps/documentation/javascript/)
* jQuery 1.8.1 (http://jquery.com)
* jQuery blockUI 2.42 (http://malsup.com/jquery/block/)
* JsRender recent Github version (https://github.com/BorisMoore/jsrender)

PHP libraries are:

* minify 2.1.5 (http://code.google.com/p/minify/)
* LightOpenID 2011-08-17 (https://gitorious.org/lightopenid/lightopenid)
* PHPMailer 5.2.1 (http://code.google.com/a/apache-extras.org/p/phpmailer/)

TODO
----

* Markup *should* be completely valid HTML5 and CSS3 for styling.
* SQL table creation script is only compatible with MySQL...
* Compare Nokia Maps (http://api.maps.nokia.com/) with Google Maps. Is it worth the effort to make them switchable?

References
----------

* Making AJAX Applications Crawlable (http://code.google.com/web/ajaxcrawling/docs/specification.html)
* Overcoming shebang (#!) without Javascript (http://www.bigspaceship.com/blog/labs/overcoming-shebang-without-javascript)
* How to detect a Ajax request? `$_SERVER['HTTP_X_REQUESTED_WITH']` (http://codeigniter.com/forums/viewthread/59450/)
* Font-Embedding Icons: This Is a Big Deal (http://somerandomdude.com/articles/design-technology/font-embedding-icons/)
* Google Maps API v3, Per-User Limit is 1.0 requests/second/user

