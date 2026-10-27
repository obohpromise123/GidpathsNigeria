# Admission information update workflow

Admission requirements change between institutions and between years. Wrong information can cost a student a whole admission cycle, so treat every change carefully.

## Ground rules

1. **Official sources only.** Use JAMB IBASS (<https://ibass.jamb.gov.ng>) for UTME subject combinations and O'Level requirements. Use the institution's own official website or brochure for institution-specific notes. News sites, blogs and forums are not sources.
2. **One institution at a time.** Never copy one institution's requirements to another, even for the same course.
3. **Never invent.** If you cannot confirm a detail, leave it empty. The website will show **"Verification required"**.
4. **No cut-off marks** unless they come from an official source for the stated year.
5. **Record what you checked.** The database refuses a "Verified" status unless the record has a source and a last-verified date. Every status change is written to an append-only history (Admin → Verification).

## Verifying a record

1. **Admin → Sources.** If the source is not listed, add it with its full web address, and the date you accessed it in *Date accessed*. For a new admission year, add a new source (e.g. `jamb-ibass-2027`).
2. **Admin → Institutions.** Check the institution's official name, type, ownership and website against the NUC (universities), NBTE (polytechnics, technical colleges) or NCCE (colleges of education) lists, then mark it verified with that source and date.
3. **Admin → Programmes offered.** Add or confirm that the institution offers the course, with the award (B.Sc., ND, NCE…), and mark it verified.
4. **Admin → Admission requirements.** Find or add the record for *that course at that institution* and set:
   - *Admission year or cycle*, e.g. `2026/2027`
   - *O'Level requirements*, exactly as the source states
   - *UTME subjects*, one per line, exactly as the source states
   - *Direct entry notes*, if the source gives them
   - *Verification status* = **Verified**, *Source*, and *Last verified on* = today
5. If the source contradicts the record, or you could not access the source, set **Verification required** and explain in *Admission notes*.

## General guidance records

Records whose *Institution* is "None — general guidance" describe typical patterns across many institutions. Keep them as **Verification required**: by design, they are not institution-specific facts.

## Each admission cycle

At the start of every UTME registration period (usually when JAMB publishes the new brochure):

1. Open **Admin → Verification** and work through the counts of records needing verification.
2. Re-check every *verified* record whose last-verified date is from a previous cycle. If it is unchanged, update the date and source. If it has changed, update the details first.
3. Add new sources for the new cycle rather than editing old ones, so the history stays truthful.

## Reporting errors from users

When a student, parent or school reports an error, record what they said in the record's *Admission notes*, set the status to **Verification required** until you have checked the official source, then follow the steps above.
