Draggable needs its own Target subclass:

Draggable.Target with registry.

I don't really like the drop_check() bit, even though it kind of works.

- Remove Movable class, it's basically the follow_cursor() logic.
- Put the Draggable.Target logic into the main Draggable class, and make Sortable a lighter extension.



# Draggable should work without Sortable and Lists

The main Draggable class can be very light, and basically a skeleton for building features.

The default drop(), if a Draggable is a container, can just be append().  But is that just for views?  In order for a Draggable to append its underlying object (a list? an object or component?), we need to know that property name.  It could be parent, as a generic.  And then try this.parent?.append?.(), I believe is the syntax.

Then, for sortable to work, there has to be the proper insert logic, and so sortable.list seems reasonable.