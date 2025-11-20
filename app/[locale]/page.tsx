import { redirect } from 'next/navigation';

export default function LocaleHome() {
  // Редиректим на ukraine
  redirect('/ukraine');
}
