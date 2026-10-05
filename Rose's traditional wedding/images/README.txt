ALREADY IN HERE — you do not need to change these:

    icon-192.png    the app icon, used when someone installs the page
    icon-512.png    the same, larger
    share.png       the picture that appears when the link is shared on
                    WhatsApp or Facebook

swap share.png for a photograph of Rose and Daniel if you have a good one.
A real photo of the two of them will do more when someone shares the link
than any graphic will. Name it share.png and put it in this folder, and it
replaces the one that is here.

The site looks for them by name. To use a photo, open config.js, find the
gallery list near the bottom, and set the src:

    { src: 'images/couple-01.jpg',  alt: 'Rose and Emeka on the day', caption: 'The two of them' }

Right now every src is set to null, which draws a labelled placeholder instead
of a broken box. That is on purpose — a placeholder looks deliberate, an empty
image box looks like something is broken.

Suggested names, if it helps:

    couple-01.jpg      both of them
    bride-regalia.jpg  Rose in traditional dress
    groom-regalia.jpg  the groom in full regalia
    bride-family.jpg   the bride's family
    groom-family.jpg   the groom's family
    ake-ije.jpg        the wedding song
    food.jpg           the feast
    night.jpg          the two of them at night

HOW BIG SHOULD THEY BE?
Around 1200px on the long edge is plenty, and keeps the page fast on a phone
with one bar of signal. Anything bigger makes the page heavy for no visible gain.

SQUARE OR PORTRAIT?
The grid crops automatically, so it does not matter much. Portraits look best.
