sap.ui.define([], function() {
	"use strict";
	return {

		dateFormatYYYYMMDD: function(oDate) {
			var mm = oDate.getMonth() + 1; // getMonth() is zero-based
			var dd = oDate.getDate();

			return [oDate.getFullYear(),
				(mm > 9 ? '' : '0') + mm,
				(dd > 9 ? '' : '0') + dd
			].join('');
		},
		YYYYMMDDtoDate: function(str) {
			var y = str.substr(0, 4),
				m = str.substr(4, 2) - 1,
				d = str.substr(6, 2);
			var D = new Date(y, m, d);
			return (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : 'invalid date';
		}
	};
});