-- Heidi admitted to cheating in 2023: her points that year count as 0.
-- Her doors stay counted.
update private.imported_scores
   set score = 0
 where year = 2023
   and name = 'Heidi'
   and email_sha256 = 'ecd69563ceffd7b770be19c80f3ec4afef39e14bb8ffa42192b57199349208e5';
