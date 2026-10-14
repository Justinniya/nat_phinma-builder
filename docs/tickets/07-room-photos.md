# 07 — Room photos

**What to build:** Mama Lita can add photos to each room and delete them.
The first photo appears on the room's card on the dashboard. A boarder
can see their own room's photos (shown from ticket 05). Added by the
team after the spec, and built before ticket 04 at their request.

**Blocked by:** 03

**Status:** todo

- [ ] A private Supabase Storage bucket `room-photos` is created in a
      numbered SQL file, with policies: the landlord may view, add and
      delete photos only for her own rooms; a boarder may only view
      photos of their own room; logged-out visitors get nothing
- [ ] Only images (JPEG, PNG, WebP) up to 5 MB are accepted
- [ ] Photos are shrunk on the phone before upload, so big camera photos
      upload quickly
- [ ] Edit room screen: photo grid, an Add photos button (several at
      once) and a delete button on each photo
- [ ] The room's first photo shows on its dashboard card; rooms without
      photos show an illustration instead
- [ ] Deleting a room also deletes its photos
- [ ] A second landlord cannot see or delete Mama Lita's photos
- [ ] Works on the live URL
