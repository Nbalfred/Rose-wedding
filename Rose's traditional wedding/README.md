# Homecoming - Rose NDAANEE and Daniel MTON

A private, sealed blessing page for Rose NDAANEE and Daniel MTON,
27 June 2026, Luekue, Ogoni Land, Rivers State, Nigeria.

---

## 1. Everything is filled in

Open `config.js` and you will find the names, the date, the village, both
families, the programme, the customs and the nine photographs all in place.
There is nothing left to type unless you want to change something.

To remove the amber bar across the top of the page, set this near the top of
`config.js` to `false`:

```js
needsSetup: false,
```

### Two things still worth doing

**`{{US_CITY}}`** - which city in the USA she came from. I never knew, and I
would not guess it, so the map currently says "The USA". It appears in the
journey story and on the map legend.

**The customs and the programme.** These are my words, not your family's. The
seven customs entries are written to be broadly true of a Niger Delta
traditional wedding, and the programme is a plausible shape for a day rather
than a record of your day. Guests from the village will know immediately if
something is wrong. Read both aloud with someone from the family and change
what is not your custom.

---

## 2. Where the blessings go

Your Supabase project is connected and **verified working**. I checked it from
outside and confirmed all of this against the live database:

| | |
|---|---|
| Guests can seal a blessing | yes, 201 Created |
| The counter works and counts correctly | yes |
| Anonymous visitors can read anything | **no, 401 refused** |
| Public signups | **off** |
| Your three accounts exist | you created them |

So the guestbook is sealed at the database level. Not hidden with CSS -
actually sealed, by Postgres, which is the only kind of sealing that survives
someone opening developer tools.

### How the sealing works

- Guests (the `anon` role) have permission to **insert** and nothing else.
- Anonymous visitors have **no read permission at all**. Not one table, not
  one column. An empty table is all a stranger can get.
- Only a signed-in account - one of your three - can read, change or delete.

Because public signups are off, the only accounts that can ever exist are the
three you made by hand. That single toggle is the load-bearing part of the
whole arrangement, and it is worth never touching again. If you ever need to
add an account, do it in the Supabase dashboard under Authentication, Users.

### One thing I could not do for you

Because Postgres cannot restrict individual columns from inside a policy, a
guest can currently put `is_read`, `is_hidden` or an old date onto their **own**
row. The worst they can do is mark their own message as read or hidden, or
backdate it. Nobody else's message is affected and nobody can read anything.

If you want it closed, run **`fix-trigger.sql`** in the SQL Editor. It adds a
trigger that makes those three columns server-controlled. Safe, and it cannot
break the form.

### Optional: a backup copy in your inbox

If you would rather not depend on one thing working, add a second route:

1. Go to **web3forms.com** and type the email address you want them sent to.
2. It gives you an **access key** immediately - no account, no password.
3. In `config.js`, set `inbox.accessKey` to that key.

Every blessing then arrives in your inbox as well as the database.

---

## 3. Test it before you share it

Do these in order. It takes ten minutes and it is the difference between
"the page works" and "the page works".

- [ ] Open `setup.html`. It tests your project live and shows red or green.
- [ ] From a **private or incognito window**, write a test blessing.
- [ ] Confirm it appears in `admin.html` **before** you tell anyone to share it.
- [ ] Sign in to `admin.html` and check the message, the name, and that the
      phone and email are collapsed until you click.
- [ ] Open `Index.html` and confirm the top bar is **green**, saying Private.
- [ ] Send the link to yourself on **WhatsApp**. Check the preview picture and
      the text. This is how most people will see it, so do not skip it.
- [ ] Open it on a **real phone**, on mobile data rather than WiFi.
- [ ] Load the page, then put the phone in airplane mode and reload. It should
      still open. That is the offline cache doing its job.
- [ ] Delete the test blessings from `admin.html` when you are done.

---

## 4. Launch

1. Go to **app.netlify.com/drop**
2. Drag this whole folder onto the page
3. Site settings, Domain management, Change site name - something like
   `rose-ndaanee-mton.netlify.app`
4. Open the live address and **check the top bar is green**
5. Send yourself one real message, then share it

`_headers` and `_redirects` are picked up automatically by Netlify. They set
the security headers, keep the admin pages out of search results, and send
mistyped addresses somewhere sensible instead of a raw server error.

Any static host works the same way - GitHub Pages, Vercel, Cloudflare Pages.
As long as it is HTTPS and serves the folder as is.

If you test by double-clicking `Index.html` instead, the service worker will
not register and the form will save to the local browser. That is fine for a
look around, but put it on a host for the real thing.

---

## How the sealing actually works

Worth reading once, because it is the part that matters.

A lot of wedding sites "hide" the messages by hiding a menu. That is not
security - anyone can right-click and choose **View Page Source**, or open
developer tools, and read everything. Hiding a page is like locking your diary
in a drawer in the middle of the room.

So the sealing happens in the **database**, not in the browser:

- Guests have permission to **insert** rows. That is all.
- Guests have **no permission to read** rows. None.
- Only a signed-in account, one of your three, has read, update and delete.

Even if a guest disables JavaScript, forges the request by hand, or downloads
the whole site, the database hands them nothing. That is enforced by Postgres,
not by hopeful JavaScript.

`admin.html` being an unlisted address is a convenience, not the protection.
The protection is the database.

### About the guest's details

The form asks for a phone number and an email so Rose and Daniel can thank
people properly afterwards. They are stored in the same sealed table, never
displayed publicly, and collapsed behind a click in the admin panel so a
screenshot of your screen leaks nothing. Delete anything you would rather not
keep, using the Delete button.

The publishable key in `config.js` is **meant** to be visible in a public web
page; Supabase issues it for exactly this purpose. It is the front door of a
house, not the key to the safe. On its own it can read nothing.

---

## Things you might want to change

| Want to | Do this |
|---|---|
| Change the date | `config.js`, the `date` block. Change `iso`, `day`, `month`, `year`, `numeric` **and** `inWords` together |
| Change a time or a title on the day | `config.js`, `programme` |
| Reorder the photographs | `config.js`, `gallery` - just move the lines |
| Change the hero photographs | `config.js`, `hero.slides` |
| Change the colours | `config.js`, `palette` |
| Add or rename a family dropdown option | `config.js`, `sides` |
| Add another country | `config.js`, `countries` |
| Trim a family name you would rather not publish | Delete that line from `families.bride` or `families.groom` |
| Change the colours and type everywhere | `Style.css`, the `:root` block at the very top |
| Remove the share buttons | Delete the `.foot__share` block from `Index.html` |
| Turn the page off | Unpublish the site in Netlify |

### A note on the page title

The `<title>` and the share description are read from the file before any
JavaScript runs, so no script can change them for a crawler or for WhatsApp.
They are currently correct. If you ever change a name or the date, open the
browser console on the live page: it prints the four correct lines to copy into
the `<head>` of `Index.html`.

---

## Files in this folder

| File | What it does |
|---|---|
| `config.js` | **Every name, date, place and photograph. This is the one you edit.** |
| `Index.html` | The page guests see |
| `Style.css` | All the colours, type and layout |
| `script.js` | The envelope, the petals, the counter, the form |
| `setup.html` / `setup.js` | Tests your project and walks you through setup |
| `admin.html` / `admin.js` | The private door |
| `manifest.json` | Lets people add it to their home screen |
| `sw.js` | Makes it readable with no signal |
| `_headers` | Security headers, applied automatically by Netlify |
| `_redirects` | Sends bare and mistyped addresses to the right page |
| `robots.txt` | Keeps the private pages out of search results |
| `supabase-schema.sql` | The full database script |
| `fix-grants.sql` | The repair if submission is ever refused |
| `fix-trigger.sql` | Closes the is_read / is_hidden loophole, if you want it |
| `images/` | The nine photographs, plus the app icons |

---

## A last thing

If you are going to run the SQL scripts again, do it in separate presses
rather than pasting the whole file as one block. The Supabase SQL Editor runs
a pasted block as a single transaction, so if one line inside it fails, every
line above it rolls back and it looks like it worked. `supabase-schema.sql` is
already split into numbered sections for that reason.

And when you are ready to publish, get someone from the family to read the
customs and the programme out loud. They will catch in about thirty seconds
what a stranger would never notice - and those are the two sections the people
who actually matter are going to read first.