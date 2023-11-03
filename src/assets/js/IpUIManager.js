var IpUiManager = new IpUiManager();

function IpUiManager() {
    this.showIpConfigurationDialog = function () {
        IpUiManager.fillFilterOrderWithDefault();
        $("#divIPConfig").show();
    };

    this.hideIpConfigurationDialog = function () {
        $("#divIPConfig").hide();
    }

    this.configureFiltersUI = function(filters) {
        _clearAllFilters();
        if (filters) {
            for (var i in filters.Filters) {
                var name = filters.Filters[i].Name;
                if (name !== 'transformation' || name !== 'colortransformation') {
                    if (!isButtonSelected('check' + name))
                        selectButton('check' + name);
                }
                if (name === 'colortransformation') {
                    var filter = filters.Filters[i];
                    _configureColorTransformationFilterUI(
                        _getFilterPropertyValue(filter, 'convertmode'),
                        _getFilterPropertyValue(filter, 'brightness'),
                        _getFilterPropertyValue(filter, 'contrast'));
                }
            }
        }
    };

    this.getFilters = function() {
        this.fillFilterOrderWithDefault();
        var filterSettings = _getFilterSettings();
        filters = IPSettings([]);

        $("#lstFiltersOrder option").each(function() {
            var listItem = $(this);
            var name = listItem.text();
            if (isButtonSelected('check' + name) ||
                name === 'transformation' ||
                name === 'colortransformation') {
                filters.Filters.push(Filter(name, filterSettings[name]));
            }
        });

        return filters;
    };

    this.fillFilterOrderWithDefault = function () {
        if ($('select#lstFiltersOrder option').length === 0) {
            var filters = _getDefaultFiltersOrder();
            filters.forEach(function (filter) {
                $("#lstFiltersOrder").append('<option>' + filter + '</option>');
            });
        }
    };


    this.onFiltersOrderUp = function onFiltersOrderUp() {
        $("#lstFiltersOrder option:selected").each(function() {
            var listItem = $(this);
            var listItemPosition = $("#lstFiltersOrder option").index(listItem) + 1;

            if (listItemPosition == 1) return false;

            listItem.insertBefore(listItem.prev());
            return true;
        });
    };

    this.onFiltersOrderDown = function onFiltersOrderDown() {
        var itemsCount = $("#list-box option").length;

        $($("#lstFiltersOrder option:selected").get().reverse()).each(function() {
            var listItem = $(this);
            var listItemPosition = $("#lstFiltersOrder option").index(listItem) + 1;

            if (listItemPosition === itemsCount) return false;

            listItem.insertAfter(listItem.next());
            return true;
        });
    };

    this.onClearAllBarcodes = function onClearAllBarcodes() {
        var allSymbols = $("#divBarcodes").children(':checkbox');
        allSymbols.removeAttr('checked');
        allSymbols.removeAttr('disabled');
    };

    this.onBarcodeSelected = function onBarcodeSelected(val) {
        if (val != undefined && val === "-1") {
            var divBarcodes = $("#divBarcodes");
            var allSymbols = divBarcodes.children(':checkbox[value=-1]');
            var children = divBarcodes.children(':checkbox[value!=-1]');
            if (allSymbols[0].checked)
                children.attr('disabled', 'disabled');
            else
                children.removeAttr('disabled');
        }
    };

    var _getFilterSettings = function() {
        var filterSettings = {};
        var filters = _getDefaultFiltersOrder();

        filters.forEach(function (filter) {
            filterSettings[filter] = [];
        });

        filterSettings["transformation"] = [FilterProperty("rotation", !getRotation() ? 0 : getRotation())];
        filterSettings["colortransformation"] = [
            FilterProperty("convertmode", $("#selColorFormat option:selected").val()),
            FilterProperty("brightness", $("#inputBrightness").val()),
            FilterProperty("contrast", $("#inputContrast").val())
        ];

        filterSettings["deskew"] = [FilterProperty("FillColor", "0,0,0")];
        filterSettings["autorotation"] = [FilterProperty("mode", "0")];
        filterSettings["autocrop"] = [FilterProperty("mode", "0")];
        filterSettings["barcodes"] = [FilterProperty("symbologies", getBarcodeConfiguration()), FilterProperty("confidence", "50")];
        filterSettings["blank"] = [FilterProperty("dirtylevel", $("#lstDirtyLevel option:selected").val())];
        var crop = getCropArea();
        filterSettings["crop"] = [FilterProperty("rectangle", crop[0] + ',' + crop[1] + ',' + crop[2] + ',' + crop[3])];
        filterSettings["annotations"] = [FilterProperty("mode", getAnnotationMode())];

        return filterSettings;
    };

    var _getDefaultFiltersOrder = function () {
        var filtersList = [
            'transformation',
            'crop',
            'colortransformation',
            'deskew',
            'autocrop',
            'despeckle',
            'lineremoval',
            'overscanremoval',
            'barcodes',
            'blank',
            'autorotation',
            'annotations'
        ];

        var filters = CCToolkit.getFilters();

        filters.forEach(function (filter) {
            if (filtersList.indexOf(filter) === -1) {
                filtersList.push(filter);
            }
        });

        return filtersList;
    };

    var _configureColorTransformationFilterUI = function(convertMode, brightness, contrast) {
        $("#selColorFormat").val(convertMode);
        $("#inputBrightness").val(brightness);
        $("#inputContrast").val(contrast);
    };

    var _getFilterPropertyValue = function(filter, propertyName) {
        for (var i = 0; i < filter.Properties.length; ++i) {
            if (filter.Properties[i].Name === propertyName)
                return filter.Properties[i].Value;
        }

        return null;
    };

    var _clearAllFilters = function() {
        // get all filters
        var i, filters = _getDefaultFiltersOrder();
        for (i = 0; i < filters.length; i++) {
            if (isButtonSelected('check' + filters[i])) {
                selectButton('check' + filters[i]);
            }
        }

        _configureColorTransformationFilterUI(0, 127, 127);

        // Uncomment this line to have Annotation rendering to On by default.
        //selectButton('checkannotations');
    };
}