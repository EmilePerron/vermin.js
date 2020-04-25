# Vermin.js: Eliminate form submission spam on your websites

Vermin is a simple script that helps you prevent spam in your website's forms.

It does so by implementing three of the most well known non-intrusive client-side spam prevention techniques for you.

## Getting started

Getting started with Vermin is a simple as including the script and calling the `init()` method with your desired configuration.

If you want to get started right away without toying with the available configurations, simply include the following snippet to your website:

```html
<script src="https://cdn.jsdelivr.net/gh/EmilePerron/vermin.js@1.0.2/src/vermin.min.js"></script>
<script>Vermin.init();</script>
<noscript>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/EmilePerron/vermin.js@1.0.2/src/vermin-noscript.css">
</noscript>
```

However, the most powerful of the three techniques that Vermin implements requires a small adjustment to your forms. Read more about this in the Action Switching section.

## How it works

There three main techniques at play in Vermin's form submission screening:
- Honeypot input
- Timer / submission delay
- Action switching

Each of these techniques can be enabled or disabled by passing the appropriate parameter in the configuration when initializing Vermin. However, as you might expect, the highest level of spam prevention requires all three to be enabled.

Let's look a how each one of these work:

### Honeypot input

When Vermin is initialized, a fake input is added to all of your forms. That fake input is hidden from view via CSS, so your regular users won't see it or interact with it.  However, robots will often fill every input with no regards to their visibility.

When your form is submitted, Vermin will check if that fake input has been filled, and will deny the submission if it is.

### Timer / submission delay

Humans tend to spend some time on a page before they fill and submit a form. Robots usually don't: more often than not, they fill your form automatically and submit it in just a few milliseconds.

When your form is submitted, Vermin will check how long ago the page was loaded, and will deny the submission if it's been less than the defined delay - 2000ms by default.

In the unlikely event that one of your visitors were to fill and submit the form within that delay, a clear error message will them to wait a few seconds and to submit it again.

### Action switching

Action switching is the most powerful of all of these spam prevention techniques. However, it is also the only one that requires a bit of work on your end to set up.

Most robots don't execute Javascript, so the other techniques won't help to screen their submissions. The idea with action switching is to set the `action` attribute of your forms to something bogus, and to then switch that for the real destination via Javascript of the form once the visitor interacts with your form.

You can set this up quite easily with Vermin: simply move your `action` attribute's value to a different attribute - `data-action` by default. Then, simply set a bogus URL for your `action`.

Here is an example:

```html
<form action="/bogus-url" data-action="submit.php">
```

## Working with AJAX

The basic spam prevention that Vermin implements works by simply calling `e.preventDefault()` on the submit event whenever a form submission is considered as spam.

However, if you are handling your form submissions with Javascript, you need to know when a form submission is sent, but only when it is not spam.

This can easily be done by listening to the `vermin-success` event instead of the `submit` event on your form. This event is triggered whenever a form submission that isn't considered as spam is made.

## Configuration

A configuration object can be passed to the `Vermin.init()` method. Ex.:

```js
Vermin.init({
  timerDelay: 1000
});
```

Here are the properties that are accepted for that configuration object.

| Property           | Type     | Default value      | Description                                                           |
|:------------------ |:-------- |:------------------ |:--------------------------------------------------------------------- |
| enableHoneypot     | boolean  | true               | Toggles the honeypot technique                                        |
| enableTimer        | boolean  | true               | Toggles the timer / submission delay technique                        |
| enableActionSwitch | boolean  | true               | Toggles the action switch technique                                   |
| actionSwitchAttr   | string   | "data-action"      | Attribute containing the real action for the action switch technique. |
| honeypotName       | string   | "favorite_address" | Name of the honeypot input                                            |
| timerDelay         | number   | 2000               | Delay (in ms) before a submission is valid for the timer technique.   |
| onDeny             | function | null               | Function that handles the error handling for the forms 3 parameters are passed: `(e, reason, errorMessage)`. If none is provided, a default error handling function is used to display the errors.                   |

## Questions, support and contributions

All contributions to this project are welcomed; simply submit a pull request and I will look into it.

If you have any questions regarding the project, you can send me an email at contact@emileperron.com

If you would like to support me and my projects, such as Vermin.js, you can [buy me a cup of tea](https://www.buymeacoffee.com/EmilePerron) - I really appreciate it!  You can also send me a message on Instagram at @veganguywhocodes - I appreciate that just as much!
