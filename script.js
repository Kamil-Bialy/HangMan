//Autor: Kamil Biały

$(document).ready(function()
{
    var xml; // plik xml
    var kategoria, liczba_hasel; // wybrana przez użytkownika kategoria oraz liczba haseł w tej kategorii
    var haslo; // wylosowane hasło
    var hasla = []; // wszystkie hasła w danej kategorii
    var ukryte_haslo = ""; // hasło w postaci znaków "_"
    var bledne = []; // zgadnięte błędne litery
    var zgadniete_litery = []; // zgadnięte poprawne litery
    var zgadniete = 0, pomylki = 0; // ilość poprawnych odgadnięć i pomyłek
    var max_bledow = 6; // maksymalna liczba błędów


    $.ajax({ // pobiera plik wyrazy.xml i przechowuje go w pliku xml
        url: 'wyrazy.xml',
        type: 'GET',
        dataType: 'xml',
        success: function (_xml) 
        {
            xml = _xml;
        }
    })


    $('input').val('');   // resetuje zawartość wejścia po zresetowaniu strony
    
    

    $('.kategoria').on('click', function() // funkcja wywoływana po wybraniu kategorii
    {
        kategoria = $(this).attr('value'); // pobiera kategorię i przechowuje ją w zmiennej
        pobierzhasla();
        generujhaslo();
    })



    /********************************************************
    * nazwa funkcji: pobierzhasla
    *
    * opis funkcji: pobiera wszystkie hasła w danej kategorii i przechowuje je w tablicy hasla[], po czym sortuje je losowo, aby za
    *               każdym razem kolejność haseł była inna
    *
    * ****************************************************/
    function pobierzhasla()
    {
        hasla = [];
        liczba_hasel = $(xml).find(kategoria).children().length;
        while(liczba_hasel != 0)
        {
            hasla.push($(xml).find(kategoria).children().eq(liczba_hasel-1).text());
            liczba_hasel--;
        }
        hasla.sort(function(a, b) // porównuje wartości
        {
            return 0.5 - Math.random() // zwraca wartość między -0.5 i 0.5, jeżeli wartość jest mniejsza od zera, zmienna a będzie 
                                       // przed zmienną b, jeżeli wartość jest większa od zera, zmienna b będzie przed zmienną a
        })
    }



    /********************************************************
    * nazwa funkcji: generujhaslo
    *
    * opis funkcji: 
    * 1. ustawia haslo jako pierwszy element tablicy hasla[], usuwa je z tej tablicy, po czym zamienia je na wielkie litery, 
    * 2. pętla tworzy ukryte_hasło w postaci "_" o długości hasła,  
    * 3. ukrywa sekcje hangmana oraz wyboru kategorii i włącza możliwość zgadywania liter,
    * 4. wypisuje w przeglądarce ukryte_haslo
    * ****************************************************/
    function generujhaslo()
    {   
        if(hasla.length == 0) // jesli uzytkownik gra dluzej i brakuje hasel, pobiera hasla ponownie
        {
            pobierzhasla();
        }
        ukryte_haslo = "";
        haslo = hasla.shift();
        haslo = haslo.toUpperCase();
        
        for(var i = 0; i <= haslo.length - 1; i++)
        {
            if(haslo[i] == " ")
            {
                ukryte_haslo = ukryte_haslo + " ";
                zgadniete++; // do liczby potrzebnych zgadnięć nie zaliczają się spacje
            }
            else
            {
                ukryte_haslo = ukryte_haslo + "_";
            }
        }

        $('.ludzik').hide();
        $('#kategorie').hide();
        $('#wejscie').show();

        $('#haslo').text(ukryte_haslo);

    };

    $('input').on('keydown', function(event) // wywołuje funkcję strzal() po wciśnięciu entera w polu wejscia
    {
        if(event.key === 'Enter')
        {
            strzal();
        }
    });



    
    /********************************************************
    * nazwa funkcji: strzal
    *
    * opis funkcji: 
    * 1. pobiera z wejscia literę i sprawdza, czy użytkownik już jej nie zgadł lub pole nie jest puste,
    * 2. tworzy zmienną "znalezione", po czym w pętli przechodzi przez całe hasło i sprawdza, czy użytkownik zgadł literę.
    * 3. jeżeli użytkownik zgadł, zmienia zmienną "znalezione" na true, poprawia ukryte_hasło, wypisuje je, a także
    *    inkrementuje zmienną zgadniete.
    * 4. jeżeli użytkownik nie zgadł litery, inkrementuje zmienną pomylki i wyświetla część hangmana.
    * 5. wywołuje funkcję czy_koniec_gry
    * ****************************************************/
    function strzal()
    {
        var litera = $('input').val().toUpperCase();
        if(bledne.includes(litera) || zgadniete_litery.includes(litera) || litera == "")
        {
            $('input').val = '';
            return;
        }
        var znalezione = false;
        for(var i = 0; i <= haslo.length - 1; i++)
        {
            if(litera == haslo[i])
            {
                znalezione = true;
                ukryte_haslo = ukryte_haslo.split(''); // 145-147 zamienia string na tablicę aby zmienić _ na poprawną literę i 
                ukryte_haslo[i] = litera;              //zamienia z powrotem na stringa
                ukryte_haslo = ukryte_haslo.join('');
                zgadniete++;
                zgadniete_litery.push(litera);
                document.getElementById('haslo').innerHTML = ukryte_haslo;
            }

        }



        if(!znalezione)
        {
            bledne.push(litera);
            $("#nietrafione").text("Błędne litery:" + bledne);
            pomylki++;
            $('#l' + pomylki).show();
        }

        $('input').val('');

        czy_koniec_gry();

    }




    /********************************************************
    * nazwa funkcji: czy_koniec_gry
    *
    * opis funkcji: wywołuje funkcję koniec_gry jeśli uzytkonik zgadł hasło lub popełnił dozwoloną ilość błędów z odpowiednim
    *               tekstem zakończenia gry 
    *****************************************************/
    function czy_koniec_gry()
    {
        if(haslo.length == zgadniete)
        {
            koniec_gry("Wygrałeś");
        }
        else if(max_bledow == pomylki)
        {
            koniec_gry("Przegrałeś");
        }
    }



    /********************************************************
    * nazwa funkcji: koniec_gry
    *
    * parametry wejściowe: tekst, przechowuje "Wygrałeś" lub "Przegrałeś" w zależności od wyniku gry
    * opis funkcji: wypisuje wynik zakończenia gry oraz poprawne hasło, a także ukrywa wejście i pokazuje sekcję ponownej gry
    *****************************************************/
    function koniec_gry(tekst)
    {
        $('#wynik').text(tekst);
        $('#haslohaslo').text("Hasło: " + haslo);
        $('#wejscie').hide();
        $('#koniec').show();
    }

    $('#od_nowa').on('click', function() // jeżeli użytkonik kliknie przycisk "od_nowa", gra zaczyna się ponownie
    {
        resetuj();
        generujhaslo();
    })

    $('#zmiana_kategorii').on('click', function() // jeżeli użytkonik kliknie przycisk "od_nowa", gra zaczyna się ponownie 
    {                                             // z opcją wyboru kategorii
        resetuj();
        $('#kategorie').show();
    })



    /********************************************************
    * nazwa funkcji: resetuj
    *
    * opis funkcji: przywraca zmienne do ich poprzedniego stanu aby pozwolić na dalszą grę
    *****************************************************/
    function resetuj()
    {
        $('input').val('');       
        $('#koniec').hide();
        bledne = [];
        $("#nietrafione").text("Błędne litery:");
        zgadniete_litery = [];
        zgadniete = 0;
        pomylki = 0;
    }

})