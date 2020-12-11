# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs.

## Final Product

!["Screenshot of editing urls page"](https://github.com/Sepehr-Sobhani/tinyapp/blob/master/docs/editing-url-page.png)

!["Screenshot of registration page"](https://github.com/Sepehr-Sobhani/tinyapp/blob/master/docs/registeration-page.png)

!["Screenshot of urls page"](https://github.com/Sepehr-Sobhani/tinyapp/blob/master/docs/urls-page.png)

!["Screenshot of new url page"](https://github.com/Sepehr-Sobhani/tinyapp/blob/master/docs/new-short-url-page.png)

## Dependencies

- Node.js
- Express
- ejs
- bcrypt
- body-parser
- cookie-session
- method-override

## Getting Started

1. Install all dependencies (using the `npm install` command).
2. Run the development web server using the `node express_server.js` command.
3. Go to `localhost:8080` on your browser, enjoy!

## How To Use TinyApp

#### Register/Login

Users must be logged in to create new links, view them, and edit them.

Just click Register on right top, put in your email and password, and you're good to go.

#### Create New Links

Either click Create a New Short Link in My URLs page, or Create New URL on navigation bar.

Then simply enter the long URL you want to shorten.

#### Edit or Delete Short Links

In My URLs, you can delete any link you want.

You can also click Edit, and then enter a new long URL to update your link. It will be the same short URL, but redirect to an updated long URL.

#### Use Your Short Link

The path to use any short link is /u/:shortLink. This will redirect you to the long URL.

You can also reach this by clicking edit on a link, and using the link corresponding to the short URL.

#### Check Creation date and Views

You can check the creation date of each link and the times each short link has been clicked.
