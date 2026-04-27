import { useState } from 'react';
export const useFiltriAvanzati = (initialFilters = {}) => {
 const [filtri, setFiltri] = useState({
 municipio_num: '',
 categoria_figc: '',
 ruolo: '',
 specializzazione: '',
 data_da: '',
 data_a: '',
 livello_esperienza_min: 0,
 pagato_abbonamento_only: false,
 ...initialFilters
 });
 const aggiorna = (key, value) => {
 setFiltri(prev => ({
 ...prev,
 [key]: value
 }));
 };
 const reset = () => {
 setFiltri(initialFilters);
 };
 const costruisciQuery = (table) => {
 let conditions = [];
 if (filtri.municipio_num) {
 conditions.push({ field: 'municipio_num', op: 'eq', value:
filtri.municipio_num });
 }
 if (filtri.categoria_figc) {
 conditions.push({ field: 'categoria_figc', op: 'eq', value:
filtri.categoria_figc });
 }
 if (filtri.ruolo) {
 conditions.push({ field: 'ruolo', op: 'eq', value: filtri.ruolo });
 }
 if (filtri.specializzazione) {
 conditions.push({ field: 'specializzazione', op: 'eq', value:
filtri.specializzazione });
 }
 if (filtri.data_da) {
 conditions.push({ field: 'data_partita', op: 'gte', value: filtri.data_da
});
 }
 if (filtri.data_a) {
 conditions.push({ field: 'data_partita', op: 'lte', value: filtri.data_a
});
 }
 if (filtri.livello_esperienza_min > 0) {
 conditions.push({ field: 'anni_esperienza', op: 'gte', value:
filtri.livello_esperienza_min });
 }
 if (filtri.pagato_abbonamento_only) {
 conditions.push({ field: 'pagato_abbonamento', op: 'eq', value: true });
 }
 return conditions;
 };
 return {
 filtri,
 aggiorna,
 reset,
 costruisciQuery
 };
};
