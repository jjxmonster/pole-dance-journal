import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy/pl")({
	component: PrivacyPolicyPage,
	head: () => ({
		meta: [
			{
				title: "Polityka Prywatności - Spinella",
			},
			{
				name: "description",
				content:
					"Polityka prywatności aplikacji Spinella - dowiedz się, jak chronimy Twoje dane osobowe i prywatność.",
			},
			{
				name: "robots",
				content: "index, follow",
			},
		],
	}),
});

function PrivacyPolicyPage() {
	return (
		<div className="mx-auto max-w-4xl py-8">
			<article className="prose max-w-none px-6 py-8">
				<p>
					<strong>Data ostatniej aktualizacji:</strong> 10 listopada 2025
				</p>
				<h2 id="1-administrator-danych">1. Administrator Danych</h2>
				<p>
					Administratorem danych osobowych jest Jakub Tarabasz odpowiedzialny za
					rozwój i funkcjonowanie aplikacji „Spinella”.
				</p>
				<p>
					Kontakt z Administratorem możliwy jest pod adresem e-mail:{" "}
					<a href="mailto:kontakt@spinella.app">kontakt@spinella.app</a>
				</p>
				<h2 id="2-zakres-gromadzonych-danych">2. Zakres Gromadzonych Danych</h2>
				<p>
					W ramach korzystania z aplikacji Spinella gromadzimy następujące dane:
				</p>
				<ul>
					<li>Podstawowy profil użytkownika: adres e-mail</li>
					<li>
						Zaszyfrowane hasło (zarządzane przez Supabase Auth) dane z Google
						OAuth
					</li>
				</ul>
				<h2 id="3-podstawa-prawna-przetwarzania">
					3. Podstawa Prawna Przetwarzania
				</h2>
				<p>Przetwarzanie danych osobowych odbywa się na podstawie:</p>
				<ul>
					<li>
						Art. 6 ust. 1 lit. b RODO – przetwarzanie jest niezbędne do
						wykonania umowy, której stroną jest osoba, której dane dotyczą
						(korzystanie z aplikacji Spinella.app stanowi zawarcie umowy o
						świadczenie usług drogą elektroniczną)
					</li>
					<li>
						Art. 6 ust. 1 lit. f RODO – przetwarzanie jest niezbędne do celów
						wynikających z prawnie uzasadnionych interesów realizowanych przez
						administratora (zapewnienie bezpieczeństwa i funkcjonalności
						aplikacji)
					</li>
				</ul>
				<h2 id="4-cele-przetwarzania-danych">4. Cele Przetwarzania Danych</h2>
				<p>Dane osobowe są przetwarzane w celu:</p>
				<ul>
					<li>
						Umożliwienia rejestracji i logowania do aplikacji Spinella.app
					</li>
					<li>
						Zapewnienia prawidłowego funkcjonowania wszystkich funkcji aplikacji
					</li>
					<li>Zapewnienia bezpieczeństwa korzystania z aplikacji</li>
					<li>
						Kontaktu w sprawach technicznych i obsługi zgłoszeń użytkowników
					</li>
				</ul>
				<h2 id="6-sposób-i-miejsce-przetwarzania">
					5. Sposób i Miejsce Przetwarzania
				</h2>
				<ul>
					<li>
						Aplikacja jest hostowana na infrastrukturze Netlify, która może
						wykorzystywać serwery w różnych lokalizacjach, w tym poza
						Europejskim Obszarem Gospodarczym.
					</li>
					<li>
						Dane przechowywane są w bazie Supabase zlokalizowanej w regionie
						eu-central-1 (Frankfurt, Niemcy), co oznacza, że główne dane
						użytkowników pozostają na terenie Unii Europejskiej.
					</li>
				</ul>
				<h2 id="7-okres-przechowywania-danych">
					6. Okres Przechowywania Danych
				</h2>
				<p>
					Dane osobowe użytkowników są przechowywane przez okres posiadania
					aktywnego konta w aplikacji Spinella.app. Po usunięciu konta dane są
					trwale usuwane z naszych systemów, z zastrzeżeniem danych, które mogą
					być przechowywane dłużej ze względu na obowiązujące przepisy prawa
					(np. dane rozliczeniowe).
				</p>
				<h2 id="8-odbiorcy-danych">8. Odbiorcy Danych</h2>
				<p>
					Dane użytkowników nie są udostępniane żadnym firmom zewnętrznym poza
					dostawcami usług niezbędnych do funkcjonowania aplikacji:
				</p>
				<ul>
					<li>Supabase – dostawca usług bazodanowych i uwierzytelniania</li>
					<li>Netlify – dostawca usług hostingowych i zabezpieczających</li>
					<li>
						Google – dostawca usług uwierzytelniania i autoryzacji w przypadku
						logowania przez Google OAuth (wyłącznie podstawowe dane profilu)
					</li>
				</ul>
				<p>
					Wymienieni dostawcy usług mają dostęp do danych użytkowników wyłącznie
					w zakresie niezbędnym do świadczenia swoich usług i podlegają
					odpowiednim zobowiązaniom dotyczącym ochrony danych.
				</p>
				<h2 id="9-przekazywanie-danych-do-państw-trzecich">
					9. Przekazywanie Danych do Państw Trzecich
				</h2>
				<p>
					W związku z korzystaniem z usług Netlify, niektóre dane mogą być
					przetwarzane na serwerach zlokalizowanych poza Europejskim Obszarem
					Gospodarczym (EOG). W takich przypadkach zapewniamy, że transfer
					danych odbywa się z zachowaniem odpowiednich zabezpieczeń, takich jak
					standardowe klauzule umowne zatwierdzone przez Komisję Europejską.
				</p>
				<h2 id="10-pliki-cookie-i-inne-technologie-śledzenia">
					10. Pliki Cookie i Inne Technologie Śledzenia
				</h2>
				<p>
					Aplikacja Spinella.app wykorzystuje podstawowe pliki cookie niezbędne
					do prawidłowego funkcjonowania aplikacji, w szczególności do
					zarządzania sesją użytkownika i zapewnienia bezpieczeństwa. Pliki te
					są niezbędne do korzystania z aplikacji i nie wymagają osobnej zgody
					użytkownika zgodnie z przepisami prawa.
				</p>
				<h2 id="11-zautomatyzowane-podejmowanie-decyzji-i-profilowanie">
					11. Zautomatyzowane Podejmowanie Decyzji i Profilowanie
				</h2>
				<p>
					Aplikacja Spinella.app nie wykorzystuje zautomatyzowanego podejmowania
					decyzji ani profilowania w rozumieniu RODO.
				</p>
				<h2 id="12-prawa-użytkownika">12. Prawa Użytkownika</h2>
				<p>Każdemu użytkownikowi przysługują następujące prawa:</p>
				<ul>
					<li>Prawo dostępu do swoich danych osobowych</li>
					<li>Prawo do sprostowania (poprawiania) swoich danych</li>
					<li>Prawo do usunięcia danych (prawo do bycia zapomnianym)</li>
					<li>Prawo do ograniczenia przetwarzania danych</li>
					<li>Prawo do przenoszenia danych</li>
					<li>Prawo do sprzeciwu wobec przetwarzania danych</li>
					<li>
						Prawo do cofnięcia zgody w dowolnym momencie, jeżeli przetwarzanie
						odbywa się na podstawie zgody
					</li>
					<li>
						Prawo do wniesienia skargi do organu nadzorczego (Prezes Urzędu
						Ochrony Danych Osobowych)
					</li>
				</ul>
				<p>
					W celu realizacji powyższych praw, prosimy o kontakt pod adresem:{" "}
					<a href="mailto:kontakt@spinella.app">kontakt@spinella.app</a>
				</p>
				<p>
					W celu usunięcia konta należy wysłać wiadomość na adres{" "}
					<a href="mailto:kontakt@spinella.app">kontakt@spinella.app</a> z
					prośbą o usunięcie konta.
				</p>
				<h2 id="13-bezpieczeństwo">13. Bezpieczeństwo</h2>
				<p>
					Dokładamy wszelkich starań, aby zabezpieczyć dane użytkowników,
					stosując m.in.:
				</p>
				<ul>
					<li>
						Szyfrowanie haseł (nigdy nie przechowujemy haseł w formie jawnej)
					</li>
					<li>Zabezpieczenia oferowane przez platformy Netlify i Supabase</li>
					<li>Szyfrowanie połączeń za pomocą protokołu HTTPS</li>
					<li>Regularne aktualizacje zabezpieczeń</li>
				</ul>
				<h2 id="14-zmiany-polityki-prywatności">
					14. Zmiany Polityki Prywatności
				</h2>
				<p>
					Administrator zastrzega sobie prawo do wprowadzania zmian w Polityce
					Prywatności. O wszelkich zmianach użytkownicy będą informowani za
					pośrednictwem wiadomości e-mail przypisanej do konta użytkownika.
					Korzystanie z aplikacji po wprowadzeniu zmian jest równoznaczne z
					akceptacją nowej wersji Polityki Prywatności.
				</p>
				<h2 id="15-postanowienia-końcowe">15. Postanowienia Końcowe</h2>
				<ul>
					<li>
						Aplikacja może zawierać linki do zewnętrznych stron lub usług; nie
						ponosimy odpowiedzialności za ich polityki prywatności.
					</li>
					<li>
						Korzystając z aplikacji Spinella.app, użytkownik akceptuje niniejszą
						Politykę Prywatności.
					</li>
					<li>
						W sprawach nieuregulowanych niniejszą Polityką Prywatności
						zastosowanie mają odpowiednie przepisy prawa, w szczególności
						Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia
						27 kwietnia 2016 r. (RODO).
					</li>
				</ul>{" "}
			</article>
		</div>
	);
}
