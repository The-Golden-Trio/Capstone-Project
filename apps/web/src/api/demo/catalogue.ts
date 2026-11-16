import type { CatalogueService } from '../port';
import { baseCatalogue, loadProfile } from './data';
import { clone, db, service } from './store';
import { ratingSummary } from './feedback';
import { myOccupation, overlay } from './rules';
export const catalogue: CatalogueService = {
  catalogue: service(async () => {
    const p = db.players.find((p) => p.me.id === db.current) ?? null;
    const data = clone(baseCatalogue);
    await Promise.all(
      data.occupations.map(async (o) => {
        o.my = await myOccupation(p, o.code);
      }),
    );
    return data;
  }),
  occupation: service(async (code) => {
    const occupation = overlay(
      db.players.find((p) => p.me.id === db.current) ?? null,
      await loadProfile(code),
    );
    occupation.ratings = ratingSummary(code);
    return occupation;
  }),
};
