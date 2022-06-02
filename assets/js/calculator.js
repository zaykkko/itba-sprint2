//Faltarían los polyfills porque IE ni de broma ejecutará esto xd
(function ($) {
    const STORAGE_ITEM_KEY = "recent_list",
        EMPTY_LIST_CLASS_NAME = "empty-list",
        DELETE_BUTTON_LABEL = "Eliminar",
        UUID_ATTRIBUTE_NAME = "data-swid";

    const payerForm = $("#payer-form"),
        listWrapper = $("#payer-list-wrapper"),
        resultContainer = $("#payer-result-container"),
        totalSpan = $("#payers-total"),
        averageSpan = $("#payers-average");

    const people = new Map(Object.entries(getListFromStorage())); //Javascript hoisting :)

    //Factories
    function listItemFactory(name, money, swid) {
        const li = $("<li/>")
            .addClass("mb-2 text-center rounded")
            .attr(UUID_ATTRIBUTE_NAME, swid);

        const h5 = $("<h5/>").addClass("fs-4").text(name);

        const h6 = $("<h6/>")
            .addClass("mb-0 fs-5 fw-normal")
            .text(`\$${money}`);

        const button = $("<button/>")
            .addClass("btn btn-danger")
            .attr("type", "button")
            .text(DELETE_BUTTON_LABEL);
        //.attr({type: "button", "aria-hidden": true})

        return li.append(h5, h6, button);
    }

    //Local storage methods
    function getListFromStorage() {
        const stored = localStorage.getItem(STORAGE_ITEM_KEY);

        return JSON.parse(stored) || {};
    }

    function saveListInStorage() {
        if (people.size) {
            const data = Object.fromEntries(people);

            localStorage.setItem(STORAGE_ITEM_KEY, JSON.stringify(data));
        } else {
            localStorage.removeItem(STORAGE_ITEM_KEY);
        }
    }

    function tryLoadStoredList() {
        if (people.size) {
            for (let [swid, data] of people.entries()) {
                addItemToList(data, swid);
            }

            calculateContribution();
            checkListEmptiness();
        }
    }

    //Checkers
    function checkListEmptiness() {
        if (people.size) {
            resultContainer.removeClass(EMPTY_LIST_CLASS_NAME);
        } else {
            resultContainer.addClass(EMPTY_LIST_CLASS_NAME);
        }
    }

    //Main methods(?
    function calculateContribution() {
        let totalMoney = 0;

        for (let {money} of people.values()) {
            totalMoney += money;
        }

        let average = totalMoney / people.size || 0;

        totalSpan.text(totalMoney.toFixed(2));
        averageSpan.text(average.toFixed(2));
    }

    function removeFromList(liElement) {
        const parent = $(liElement);

        const swid = parent.attr(UUID_ATTRIBUTE_NAME);
        people.delete(swid);

        parent.remove();
    }

    function addItemToList({name, money}, predefinedSwid) {
        money = parseFloat(money);

        const swid = predefinedSwid || uuid.v4();
        people.set(swid, {money, name});

        listWrapper.append(listItemFactory(name, money, swid));
    }

    //Listener handlers
    function onDeleteButtonClick(event) {
        event.stopPropagation();

        const target = event.target.parentElement;

        if (target.getAttribute(UUID_ATTRIBUTE_NAME)) {
            removeFromList(target);

            calculateContribution();
            checkListEmptiness();

            saveListInStorage();
        }
    }

    function onPayerFormSubmit(event) {
        event.preventDefault();

        const data = $(this)
            .serializeArray()
            .reduce((prev, {name, value}) => {
                prev[name] = value;

                return prev;
            }, {});

        $(this)[0].reset();

        if (!isNaN(data.money) && data.name) {
            addItemToList(data);

            calculateContribution();
            checkListEmptiness();

            saveListInStorage();
        }
    }

    //attach listeners
    payerForm.on("submit", onPayerFormSubmit);
    listWrapper.on("click", onDeleteButtonClick);

    //try to load localStorage's stored list
    tryLoadStoredList();
})(jQuery);
