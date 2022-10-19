$(document).ready(function () {


    // סליחה מראש אם יש הרבה הערות 

    $('.popup').hide()

    $('#not-found').hide()


    $('.reports').hide()
    $('.about').hide()
    $('.All-coins').show()


    $('.Mbtn').click(function (e) {

        if ($(this).text() == 'coins') {

            $('.reports').hide()
            $('.about').hide()
            $('.All-coins').show()

        } else if ($(this).text() == 'reports') {

            $('.about').hide()
            $('.All-coins').hide()
            $('.reports').show()

        } else if ($(this).text() == 'about') {
            $('.All-coins').hide()
            $('.reports').hide()
            $('.about').show()
        }
    })


    $(document).ajaxSend(function () {
        $('#loading').show();

        $('body').css("background-image", "url(bitcoim.jpg)")
    });


    $(document).ajaxComplete(function () {
        $('#loading').hide();

    });

    // ========================================= הגדרת משתנים לשימוש עתידי========================

    let DidNotPassSelectionCoin


    let coinDataObj = {
        img: "",
        dollar: "",
        euro: "",
        shkel: "",
        firstTime: ""
    }

    let coinArr = []

    let FutureCurrencyData = []

    // קריאה ל API

    GetApiCoins()      /* queen function of api */

    function GetApiCoins() {
        $.get(`https://api.coingecko.com/api/v3/coins`, function (CoinsArr) {
            FutureCurrencyData = CoinsArr
            DrowApiCoins()
        })
    }


    // ============================= DrowApiCoins ================================


    function DrowApiCoins() {

        $('.All-coins').html('')

        for (const coin of FutureCurrencyData) {

            $('.All-coins').append(`
<div class="coin"  id="${coin.symbol}">
<div class="names" >

    <label class="switch">
        <input type="checkbox" class="checkbox  ${coin.id} ">
        <span class="slider round"></span>
    </label>
    <h2 class="NickName">${coin.symbol}</h2>

</div>
<h3 class="C-name">${coin.id}</h3>
<button class="infoBtn Mbtn">more info</button>
<div class="more-info"></div>
</div>
`)

            $('.more-info').hide()

        }  /*לולאת פוראוף*/

        $('.infoBtn').click(AddCoinToLocalStorageOrNot)

        $('input.checkbox').click(AddToGraph)
    }



    // ============================ AddCoinToLocalStorageOrNot ================================

    function AddCoinToLocalStorageOrNot(e) {
        const coineID = $(this).prev().text()

        if ((!localStorage.getItem($(this).prev().text()))) {

            GetMoreInfo(coineID, e)

        } else {
            coinDataObj = JSON.parse(localStorage.getItem($(this).prev().text()))

            if ((new Date().getTime()) - (coinDataObj.firstTime) < ((1000 * 60) * 2)) {

                const time = (new Date().getTime()) - (coinDataObj.firstTime)
                drowData(coinDataObj, e, time)

            } else {
                localStorage.removeItem(localStorage.getItem($(this).prev().text()))

                GetMoreInfo(coineID, e)

            }

        }

    }  /* של הפונקציה שלי */



    // ===================================== GetMoreInfo ========================


    function GetMoreInfo(coineID, e) {

        $.get(`https://api.coingecko.com/api/v3/coins/${coineID}`, CoinData => {

            coinDataObj.img = CoinData.image.small
            coinDataObj.dollar = CoinData.market_data.current_price.usd
            coinDataObj.euro = CoinData.market_data.current_price.eur
            coinDataObj.shkel = CoinData.market_data.current_price.ils
            coinDataObj.firstTime = new Date().getTime()

            localStorage.setItem($(e.target).prev().text(), JSON.stringify(coinDataObj))

            drowData(coinDataObj, e)

        })

    }

    // =========================================== drowData =======================

    function drowData(coinDataObj, e) {

        let { firstTime } = coinDataObj

        $(e.target).next('.more-info').html('')
        $(e.target).next('.more-info').append(`
        <img src="${coinDataObj.img}" alt="coin pic not found" class="C-img">
        <div class="prises">
  <h5 class="dollar">USD: ${coinDataObj.dollar.toFixed(2)}  $</h5>
    <h5 class="euro" >EUR: ${coinDataObj.euro.toFixed(2)} €</h5>
   <h5 class="shakel">ILS: ${coinDataObj.shkel.toFixed(2)} ₪</h5>
</div>
`)

        $(e.target).next('.more-info').slideToggle()

        if (firstTime < (1000 * 60) * 2) {
            setTimeout(() => {
                // console.log("im frome time 1 ")
                localStorage.removeItem(($(e.target).prev().text()))
            }, ((1000 * 60) * 2) - firstTime)

        } else {
            setTimeout(() => {
                // console.log("im frome time 2 ")
                localStorage.removeItem(($(e.target).prev().text()))
            }, (1000 * 60) * 2)

        }
    }

    // ===================================== כפתור חיפוש ========================

    $('.sherch-Btn').click(function () {

        if ($('.inp').val() == '') {
            DrowApiCoins()
            $('.All-coins').css("height", "100%")

        } else {

            for (const i of $(`.coin`)) {

                if (i.id != $('.inp').val()) {

                    $('.All-coins').css("height", "100vh")
                    $(i).hide()

                } else {
                    $('#not-found').show()
                }
            }
        }

        $('.inp').val('')
    })


    // ========================== כפתור אפשר שינויים ===========================


    $('#Apply').click(function ApplyFunction(e) {

        let popupToggels = $(".popup-checkbox")

        for (const i of popupToggels) {
            if (i.checked == false) {

                $(`#${$(i).val()}`).remove()
                coinArr = coinArr.filter((e) => {
                    return e != $(i).val()
                })
            }
        }

        if (coinArr.length < 5) {

            coinArr.push(DidNotPassSelectionCoin)

            $('.smallpopup').append(`
            <div class="popup-coin" id="${DidNotPassSelectionCoin}">
                <label class="switch">
                    <input type="checkbox" class="popup-checkbox" checked  value="${DidNotPassSelectionCoin}">
                    <span class="slider round"></span>
                </label>
                <h3>${DidNotPassSelectionCoin}</h3>
            </div>
            `)

        }

        $(`input.${DidNotPassSelectionCoin}`).prop("checked", true)

        $('.popup-checkbox').change(Makes2TogglesCommunicate)

        $('.popup').fadeOut(1000)

    })



    function AddToGraph(e) {

        let coinName = $(this).parentsUntil('.coin').next()[1]     /* במשתנה זה יש לי את השם של המטבע שאני רוצה להוסיף לגרף לדוגמא ביטקט=ויין*/
        let acronyms = $(this).parent().next().text()

        if (this.checked == false) {
            $(`#${$(coinName).text()}`).remove()
            coinArr = coinArr.filter((e) => {
                return e != $(coinName).text()
            })

        } else if (this.checked == true && coinArr.length < 5) {

            coinArr.push($(coinName).text())

            $('.smallpopup').append(`
            <div class="popup-coin" id="${$(coinName).text()}">
                <label class="switch">
                    <input type="checkbox" class="popup-checkbox ${acronyms}" checked  value="${$(coinName).text()}">
                    <span class="slider round"></span>
                </label>
                <h3>${$(coinName).text()}</h3>
            </div>
            `)

            $('.popup-checkbox').change(Makes2TogglesCommunicate)

        } else {

            e.preventDefault()
            DidNotPassSelectionCoin = $(coinName).text()

            $('.popup').fadeIn(1000)
        }

    }



    function Makes2TogglesCommunicate(i) {
        if (this.checked) {
            $(`input.${$(this).val()}`).prop("checked", true)
        } else {
            $(`input.${$(this).val()}`).prop("checked", false)
        }

    }


    $('#cancel').click(() => {

        $('.popup-checkbox').change(Makes2TogglesCommunicate)

        for (const i of $('.popup-checkbox')) {
            console.log(i)
            $(i).prop("checked", true)
        }

        $('.popup').fadeOut(1000)
    })


});