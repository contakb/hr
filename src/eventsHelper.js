// eventsHelper.js
import { addDays, isSaturday, isSunday } from 'date-fns';

export const generateRecurringEvents = (year) => {
  const events = [];
  for (let month = 0; month < 12; month++) {
    let socialInsuranceDate = new Date(year, month, 15);
    let zusDeclarationDate = new Date(year, month, 15);
    let incomeTaxDate = new Date(year, month, 20);

    // Adjust dates if they fall on a weekend
    if (isSaturday(socialInsuranceDate)) {
      socialInsuranceDate = addDays(socialInsuranceDate, 2);
    } else if (isSunday(socialInsuranceDate)) {
      socialInsuranceDate = addDays(socialInsuranceDate, 1);
    }

    if (isSaturday(zusDeclarationDate)) {
      zusDeclarationDate = addDays(zusDeclarationDate, 2);
    } else if (isSunday(zusDeclarationDate)) {
      zusDeclarationDate = addDays(zusDeclarationDate, 1);
    }

    if (isSaturday(incomeTaxDate)) {
      incomeTaxDate = addDays(incomeTaxDate, 2);
    } else if (isSunday(incomeTaxDate)) {
      incomeTaxDate = addDays(incomeTaxDate, 1);
    }

    // Social insurance payment due
    events.push({
      id: `social_insurance_${year}_${month}`,
      title: 'Płatność składek ZUS',
      description: 'Wykonaj przelew na konto indywidualne w ZUS',
      date: socialInsuranceDate,
    });

    // Declaration to ZUS due
    events.push({
      id: `zus_declaration_${year}_${month}`,
      title: 'Termin wysyłki deklaracji do ZUS',
      description: 'Wyślij deklarację do ZUS',
      date: zusDeclarationDate,
    });

    // Income tax payment due
    events.push({
      id: `income_tax_${year}_${month}`,
      title: 'Podatek Pit-4R',
      description: 'Płatność podatku do US',
      date: incomeTaxDate,
    });
  }
  return events;
};
