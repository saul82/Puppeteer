import type { IEPData } from './types';

function s(val: string | null | undefined): string {
  return val ?? '';
}

function cb(val: boolean | null | undefined): string {
  return val ? 'on' : '';
}

function cbNot(val: boolean | null | undefined): string {
  return val ? '' : 'on';
}

function cbEq(val: string | null | undefined, target: string): string {
  return val === target ? 'on' : '';
}

function parseName(legalName: string): { last: string; first: string; middle: string } {
  const parts = legalName.split(',').map(p => p.trim());
  const last = parts[0] || '';
  const rest = (parts[1] || '').split(/\s+/);
  const first = rest[0] || '';
  const middle = rest.slice(1).join(' ');
  return { last, first, middle };
}

export function buildVariableMap(data: IEPData): Record<string, string> {
  const { meta, student, parents, district, eligibility, initialPlacementOnly,
    presentLevels, specialFactors, esyEligibility, fapeServices, placementForm,
    stateAssessments, transition, emergencyPlan, bip } = data;

  const name = parseName(student.legalName);
  const p1 = parents[0] || {} as Record<string, unknown>;
  const p2 = parents[1] || {} as Record<string, unknown>;

  const vars: Record<string, string> = {};

  // ── Page 1: Info/Eligibility ──
  vars['studentLastName'] = name.last;
  vars['studentFirstName'] = name.first;
  vars['studentMiddleName'] = name.middle;
  vars['legalSuffix'] = s(student.suffix);
  vars['dob'] = s(student.dob);
  vars['iepDate'] = s(meta.iepDate);
  vars['originalEntryDate'] = s(initialPlacementOnly.initialEligibilityDate);
  vars['nextAnnualReview'] = s(meta.nextAnnualReview);
  vars['lastReeval'] = s(meta.lastReevaluation);
  vars['nextReeval'] = s(meta.nextReevaluation);

  // Meeting type checkboxes
  vars['meetingInitial'] = cbEq(meta.meetingType, 'Inicial');
  vars['meetingPlanReview'] = cbEq(meta.meetingType, 'Revisión del Plan');
  vars['meetingReeval'] = cbEq(meta.meetingType, 'Reevaluación');

  // Additional purpose
  vars['addlTransition'] = cbEq(meta.additionalPurpose, 'Transición');
  vars['addlPreExpulsion'] = cbEq(meta.additionalPurpose, 'Pre-expulsión');
  vars['addlInterim'] = cbEq(meta.additionalPurpose, 'Interino');
  vars['addlOther'] = (meta.additionalPurpose && !['Transición', 'Pre-expulsión', 'Interino'].includes(meta.additionalPurpose)) ? 'on' : '';

  // Demographics
  vars['age'] = s(student.age);
  vars['grade'] = s(student.grade);
  vars['nativeLanguage'] = s(student.nativeLanguage);
  vars['elYes'] = cb(student.isEL);
  vars['elNo'] = cbNot(student.isEL);
  vars['redesigYes'] = cb(student.isReclassified);
  vars['redesigNo'] = cbNot(student.isReclassified);
  vars['interpYes'] = cb(student.interpreterNeeded);
  vars['interpNo'] = cbNot(student.interpreterNeeded);
  vars['districtID'] = s(student.districtId);
  vars['ssid'] = s(student.ssid);

  // Parent 1
  vars['parent1Name'] = s(p1.name as string);
  vars['parent1Address'] = s(p1.address as string);
  vars['parent1City'] = s(p1.city as string);
  vars['parent1StateZip'] = [s(p1.state as string), s(p1.zip as string)].filter(Boolean).join(', ');
  vars['parent1HomePhone'] = s(p1.homePhone as string);
  vars['parent1WorkPhone'] = s(p1.workPhone as string);
  vars['parent1CellPhone'] = s(p1.cellPhone as string);
  vars['parent1Email'] = s(p1.email as string);

  // Parent 2
  vars['parent2Name'] = s(p2.name as string);
  vars['parent2Address'] = s(p2.address as string);
  vars['parent2City'] = s(p2.city as string);
  vars['parent2StateZip'] = [s(p2.state as string), s(p2.zip as string)].filter(Boolean).join(', ');
  vars['parent2HomePhone'] = s(p2.homePhone as string);
  vars['parent2WorkPhone'] = s(p2.workPhone as string);
  vars['parent2CellPhone'] = s(p2.cellPhone as string);
  vars['parent2Email'] = s(p2.email as string);

  // District
  vars['districtAccountability'] = s(district.responsibleDistrict);
  vars['residenceSchool'] = s(district.residenceSchool);
  vars['districtOfService'] = s(district.serviceDistrict);
  vars['schoolOfAttendance'] = s(district.attendanceSchool);

  // Ethnicity/Race
  vars['hispanicYes'] = cb(student.hispanicEthnicity);
  vars['hispanicNo'] = cbNot(student.hispanicEthnicity);
  vars['hispanicBlank'] = cb(student.ethnicityBlank);
  vars['race1'] = s(student.race1);
  vars['race2'] = s(student.race2);
  vars['race3'] = s(student.race3);
  vars['race4'] = '';
  vars['race5'] = '';
  vars['raceBlank'] = cb(student.raceBlank);

  // Disability
  vars['primaryDisability'] = s(eligibility.primaryDisability);
  vars['secondaryDisability'] = s(eligibility.secondaryDisability);
  vars['notEligible'] = cb(eligibility.notEligible);
  vars['exiting'] = cb(eligibility.exitingSpecialEducation);
  vars['disabilityImpactStatement'] = s(eligibility.disabilityImpactDescription);

  // Initial Placement
  vars['ceisYes'] = cb(initialPlacementOnly.receivedCEIS);
  vars['ceisNo'] = cbNot(initialPlacementOnly.receivedCEIS);
  vars['initialReferralDate'] = s(initialPlacementOnly.initialReferralDate);
  vars['referralInitiator'] = s(initialPlacementOnly.referralInitiatedBy);
  vars['parentConsentDate'] = s(initialPlacementOnly.parentConsentDate);
  vars['eligibilityMeetingDate'] = s(initialPlacementOnly.initialEligibilityDate);

  // ── Page 2: Present Levels ──
  vars['strengthsStatement'] = s(presentLevels.strengthsInterests);
  vars['parentConcerns'] = s(presentLevels.parentConcerns);

  // SBAC ELA
  vars['sbacELAna'] = cb(presentLevels.sbac.elaNotApplicable);
  vars['sbacELAexceeded'] = cbEq(presentLevels.sbac.elaOverall, 'Estándar Excedido');
  vars['sbacELAmet'] = cbEq(presentLevels.sbac.elaOverall, 'Estándar Cumplido');
  vars['sbacELAnearlyMet'] = cbEq(presentLevels.sbac.elaOverall, 'Estándar Casi Cumplido');
  vars['sbacELAnotMet'] = cbEq(presentLevels.sbac.elaOverall, 'Estándar No Cumplido');

  vars['sbacELAreadAbove'] = cbEq(presentLevels.sbac.elaReadListening, 'Arriba del Estándar');
  vars['sbacELAreadNear'] = cbEq(presentLevels.sbac.elaReadListening, 'Cerca del Estándar');
  vars['sbacELAreadBelow'] = cbEq(presentLevels.sbac.elaReadListening, 'Por Debajo del Estándar');

  vars['sbacELAwriteAbove'] = cbEq(presentLevels.sbac.elaWritingResearch, 'Arriba del Estándar');
  vars['sbacELAwriteNear'] = cbEq(presentLevels.sbac.elaWritingResearch, 'Cerca del Estándar');
  vars['sbacELAwriteBelow'] = cbEq(presentLevels.sbac.elaWritingResearch, 'Por Debajo del Estándar');

  // SBAC Math
  vars['sbacMathNA'] = cb(presentLevels.sbac.mathNotApplicable);
  vars['sbacMathExceeded'] = cbEq(presentLevels.sbac.mathOverall, 'Estándar Excedido');
  vars['sbacMathMet'] = cbEq(presentLevels.sbac.mathOverall, 'Estándar Cumplido');
  vars['sbacMathNearlyMet'] = cbEq(presentLevels.sbac.mathOverall, 'Estándar Casi Cumplido');
  vars['sbacMathNotMet'] = cbEq(presentLevels.sbac.mathOverall, 'Estándar No Cumplido');

  vars['sbacMathCPabove'] = cbEq(presentLevels.sbac.mathConceptsProcedures, 'Arriba del Estándar');
  vars['sbacMathCPnear'] = cbEq(presentLevels.sbac.mathConceptsProcedures, 'Cerca del Estándar');
  vars['sbacMathCPbelow'] = cbEq(presentLevels.sbac.mathConceptsProcedures, 'Por Debajo del Estándar');

  vars['sbacMathMPabove'] = cbEq(presentLevels.sbac.mathPractices, 'Arriba del Estándar');
  vars['sbacMathMPnear'] = cbEq(presentLevels.sbac.mathPractices, 'Cerca del Estándar');
  vars['sbacMathMPbelow'] = cbEq(presentLevels.sbac.mathPractices, 'Por Debajo del Estándar');

  // CAA
  vars['caaNA'] = cb(presentLevels.caa.notApplicable);
  vars['caaELAund'] = cbEq(presentLevels.caa.ela, 'Entendiendo');
  vars['caaELAfound'] = cbEq(presentLevels.caa.ela, 'Entendimiento Básico');
  vars['caaELAlim'] = cbEq(presentLevels.caa.ela, 'Entendimiento Limitado');
  vars['caaMathUnd'] = cbEq(presentLevels.caa.math, 'Entendiendo');
  vars['caaMathFound'] = cbEq(presentLevels.caa.math, 'Entendimiento Básico');
  vars['caaMathLim'] = cbEq(presentLevels.caa.math, 'Entendimiento Limitado');
  vars['caaSciUnd'] = cbEq(presentLevels.caa.science, 'Entendiendo');
  vars['caaSciFound'] = cbEq(presentLevels.caa.science, 'Entendimiento Básico');
  vars['caaSciLim'] = cbEq(presentLevels.caa.science, 'Entendimiento Limitado');

  // ELD / ELPAC
  vars['eldNA'] = cb(presentLevels.elpac.notApplicable);
  vars['elpacInitial'] = cb(presentLevels.elpac.initialELPAC);
  vars['elpacSummative'] = cb(presentLevels.elpac.summativeELPAC);
  vars['elpacOverallScore'] = s(presentLevels.elpac.overallScore);
  vars['elpacOverallLevel'] = s(presentLevels.elpac.overallPerformanceLevel);
  vars['elpacOralLevel'] = s(presentLevels.elpac.oralLanguageScore);
  vars['elpacWrittenLevel'] = s(presentLevels.elpac.writtenLanguageScore);
  vars['elpacListeningScore'] = s(presentLevels.elpac.listening);
  vars['elpacSpeakingScore'] = s(presentLevels.elpac.speaking);
  vars['elpacReadingScore'] = s(presentLevels.elpac.reading);
  vars['elpacWritingScore'] = s(presentLevels.elpac.writing);
  // Performance per domain placeholders
  vars['elpacListeningPerf'] = '';
  vars['elpacSpeakingPerf'] = '';
  vars['elpacReadingPerf'] = '';
  vars['elpacWritingPerf'] = '';

  // ── Page 3: Alt ELPAC / Assessments ──
  vars['altElpacInitial'] = cb(presentLevels.elpacAlternate.initialAlternate);
  vars['altElpacSummative'] = cb(presentLevels.elpacAlternate.summativeAlternate);
  vars['altElpacOverallScore'] = s(presentLevels.elpacAlternate.overallScore);
  vars['altElpacLevel'] = s(presentLevels.elpacAlternate.overallPerformanceLevel);

  vars['peTesting'] = s(presentLevels.physicalFitnessTest);
  vars['otherAssessmentData'] = s(presentLevels.otherEvaluationData);

  // Hearing/Vision
  vars['hearingDate'] = s(presentLevels.hearing.date);
  vars['hearingPass'] = cbEq(presentLevels.hearing.result, 'Pasó');
  vars['hearingFail'] = cbEq(presentLevels.hearing.result, 'No Pasó');
  vars['hearingOther'] = (presentLevels.hearing.result && !['Pasó', 'No Pasó'].includes(presentLevels.hearing.result)) ? 'on' : '';

  vars['nearVisionDate'] = s(presentLevels.visionNearSighted.date);
  vars['nearVisionPass'] = cbEq(presentLevels.visionNearSighted.result, 'Pasó');
  vars['nearVisionFail'] = cbEq(presentLevels.visionNearSighted.result, 'No Pasó');
  vars['nearVisionOther'] = (presentLevels.visionNearSighted.result && !['Pasó', 'No Pasó'].includes(presentLevels.visionNearSighted.result)) ? 'on' : '';

  vars['distVisionDate'] = s(presentLevels.visionFarSighted.date);
  vars['distVisionPass'] = cbEq(presentLevels.visionFarSighted.result, 'Pasó');
  vars['distVisionFail'] = cbEq(presentLevels.visionFarSighted.result, 'No Pasó');
  vars['distVisionOther'] = (presentLevels.visionFarSighted.result && !['Pasó', 'No Pasó'].includes(presentLevels.visionFarSighted.result)) ? 'on' : '';

  // ── Pages 3-4: Present Levels narrative ──
  vars['academicProvider'] = '';
  vars['academicYear'] = '';
  vars['academicFunctionalStatement'] = s(presentLevels.preAcademicSkills);
  vars['commProvider'] = '';
  vars['commYear'] = '';
  vars['communicationStatement'] = s(presentLevels.communicationDevelopment);
  vars['motorStatement'] = s(presentLevels.motorDevelopment);
  vars['socialYear'] = '';
  vars['socialEmotionalStatement'] = s(presentLevels.socialEmotionalBehavior);
  vars['vocYear'] = '';
  vars['vocationalStatement'] = s(presentLevels.vocational);
  vars['adlYear'] = '';
  vars['adaptiveDailyStatement'] = s(presentLevels.dailyLivingSkills);
  vars['healthStatement'] = s(presentLevels.health);
  vars['ihpYes'] = cb(presentLevels.hasIndividualHealthPlan);
  vars['ihpNo'] = cbNot(presentLevels.hasIndividualHealthPlan);
  vars['areasOfNeed'] = s(presentLevels.areasOfNeed);

  // ── Page 9: Special Factors ──
  vars['atYes'] = cb(specialFactors.needsAssistiveTechnology);
  vars['atNo'] = cbNot(specialFactors.needsAssistiveTechnology);
  vars['liYes'] = cb(specialFactors.needsLowFrequencyEquipment);
  vars['liNo'] = cbNot(specialFactors.needsLowFrequencyEquipment);
  vars['blindConsiderations'] = s(specialFactors.blindVisualImpairmentConsiderations);
  vars['deafConsiderations'] = s(specialFactors.deafHearingImpairmentConsiderations);

  // ELD section
  vars['eldSupYes'] = cb(specialFactors.eldPrimaryLanguageSupport);
  vars['eldSupNo'] = specialFactors.isELStudent ? cbNot(specialFactors.eldPrimaryLanguageSupport) : '';

  const eldStrategies = specialFactors.eldSupportStrategies || [];
  vars['eldOral'] = cb(eldStrategies.includes('Clarificación Oral de instrucciones en el idioma principal'));
  vars['eldGloss'] = cb(eldStrategies.includes('Glosarios ilustrados en el idioma principal'));
  vars['eldGraphic'] = cb(eldStrategies.includes('Organizador gráfico incluyendo conceptos clave traducidos al idioma principal'));
  vars['eldPairVisual'] = cb(eldStrategies.includes('Combinar texto/palabras clave traducidas al idioma principal con imágenes visuales'));
  vars['eldPair'] = cb(eldStrategies.includes('Combinar texto/palabras clave traducidas al idioma principal'));
  vars['eldDefs'] = cb(eldStrategies.includes('Proporcionar definiciones en el idioma principal del contexto de la lección'));
  vars['eldFront'] = cb(eldStrategies.includes('Enseñar previamente usando el idioma principal, para relacionar el nuevo aprendizaje con los conocimientos previos'));
  vars['eldRelations'] = cb(eldStrategies.includes('Enseñar las relaciones entre los conceptos en el idioma principal'));
  vars['eldCheck'] = cb(eldStrategies.includes('Realizar revisiones de entendimiento frecuentemente, permitir que el estudiante responda en el idioma principal'));
  vars['eldDict'] = cb(eldStrategies.includes('Diccionario bilingüe'));
  vars['eldGlossary'] = cb(eldStrategies.includes('Glosarios en el idioma principal'));
  vars['eldOtherCB'] = '';

  vars['eldLocGenEd'] = cbEq(specialFactors.eldProgramLocation, 'Educación General');
  vars['eldLocSpEd'] = cbEq(specialFactors.eldProgramLocation, 'Educación Especial');

  vars['eldSEI'] = specialFactors.eldProgramType?.includes('SEI') ? 'on' : '';
  vars['eldMulti'] = (specialFactors.eldProgramType && !specialFactors.eldProgramType.includes('SEI')) ? 'on' : '';

  // Behavior
  vars['behaviorYes'] = cb(specialFactors.behaviorImpactsLearning);
  vars['behaviorNo'] = cbNot(specialFactors.behaviorImpactsLearning);
  vars['behaviorGoal'] = cb(specialFactors.behaviorGoalInIEP);
  vars['bipAttached'] = cb(specialFactors.bipAttached);

  // ── Page 10: FAPE Services ──
  vars['fapeServiceOptions'] = s(fapeServices.servicesConsidered);
  vars['lreHarmStatement'] = s(fapeServices.lreDescription);
  vars['accNotNeeded'] = cbNot(fapeServices.programAdaptationsNeeded);
  vars['accNeeded'] = cb(fapeServices.programAdaptationsNeeded);
  vars['modNotNeeded'] = cbNot(fapeServices.programModificationsNeeded);
  vars['modNeeded'] = cb(fapeServices.programModificationsNeeded);
  vars['supNotNeeded'] = cbNot(fapeServices.otherSupportsNeeded);
  vars['supNeeded'] = cb(fapeServices.otherSupportsNeeded);

  // ── Page 11: Placement ──
  vars['peGeneral'] = cbEq(placementForm.physicalEducation, 'General');
  vars['peSpecial'] = cbEq(placementForm.physicalEducation, 'Designada Especialmente');
  vars['peOther'] = (placementForm.physicalEducation && !['General', 'Designada Especialmente'].includes(placementForm.physicalEducation)) ? 'on' : '';

  vars['allServResYes'] = cb(placementForm.allServicesAtResidenceSchool);
  vars['allServResNo'] = cbNot(placementForm.allServicesAtResidenceSchool);

  vars['programSetting'] = s(placementForm.programEnvironment);
  vars['timeOutside'] = String(placementForm.percentTimeOutsideRegularClass ?? '');
  vars['timeInside'] = String(placementForm.percentTimeInsideRegularClass ?? '');
  vars['planStartDate'] = s(meta.effectiveStartDate);
  vars['nonParticipationReason'] = s(placementForm.nonParticipationReason);

  // Other agencies
  vars['agencyMH'] = cb(placementForm.otherAgencies.countyMentalHealth);
  vars['agencyCCS'] = cb(placementForm.otherAgencies.ccs);
  vars['agencyRC'] = cb(placementForm.otherAgencies.regionalCenter);
  vars['agencyProb'] = cb(placementForm.otherAgencies.probation);
  vars['agencyDOR'] = cb(placementForm.otherAgencies.rehabilitation);
  vars['agencyDSS'] = cb(placementForm.otherAgencies.dss);
  vars['agencyOther'] = placementForm.otherAgencies.other ? 'on' : '';

  // Promotion/Progress
  vars['promDistrict'] = cbEq(placementForm.promotionRequirements, 'District');
  vars['promGoals'] = cbEq(placementForm.promotionRequirements, 'Progreso de las metas');
  vars['promOther'] = (placementForm.promotionRequirements && !['District', 'Progreso de las metas'].includes(placementForm.promotionRequirements)) ? 'on' : '';

  vars['progQuarterly'] = cbEq(placementForm.parentProgressNotification, 'Cada tres meses');
  vars['progTrimester'] = cbEq(placementForm.parentProgressNotification, 'Cada cuatro meses');
  vars['progSemester'] = cbEq(placementForm.parentProgressNotification, 'Semestre');
  vars['progOther'] = (placementForm.parentProgressNotification && !['Cada tres meses', 'Cada cuatro meses', 'Semestre'].includes(placementForm.parentProgressNotification)) ? 'on' : '';

  vars['progReport'] = placementForm.progressReportMethod?.includes('Informe de Resumen de Progreso') ? 'on' : '';
  vars['progHowOther'] = (placementForm.progressReportMethod && !placementForm.progressReportMethod.includes('Informe de Resumen de Progreso')) ? 'on' : '';

  vars['transitionActivities'] = s(placementForm.transitionActivities);

  // ESY
  vars['esyYes'] = cb(fapeServices.esyQualifies);
  vars['esyNo'] = cbNot(fapeServices.esyQualifies);
  vars['esyRationale'] = s(fapeServices.esyRationale);

  // Transportation
  vars['transpYes'] = cb(fapeServices.specialEdTransportation);
  vars['transpNo'] = cbNot(fapeServices.specialEdTransportation);
  vars['transpComment'] = s(fapeServices.transportationNotes);

  // ESY continuation (same values)
  vars['esyYesCont'] = cb(fapeServices.esyQualifies);
  vars['esyNoCont'] = cbNot(fapeServices.esyQualifies);
  vars['esyRationaleCont'] = s(fapeServices.esyRationale);

  // ── Page 12: Signatures — mostly blank signature fields ──
  vars['consentAgree'] = '';
  vars['consentPartial'] = '';
  vars['consentDecline'] = '';
  vars['consentNotElig'] = '';
  vars['consentNoLonger'] = '';
  vars['parentInvYes'] = '';
  vars['parentInvNo'] = '';
  vars['parentInvNR'] = '';
  vars['safeguardsRcvd'] = '';
  vars['assessRptRcvd'] = '';
  vars['iepCopyRcvd'] = '';
  vars['mediCalNotice'] = '';
  vars['privateSchool'] = '';

  // ── Pages 13-14: ITP ──
  vars['itpStudentInvYes'] = cb(transition.studentInvited);
  vars['itpStudentInvNo'] = cbNot(transition.studentInvited);
  vars['itpAgencyYes'] = cb(transition.agenciesInvited);
  vars['itpAgencyNo'] = transition.agenciesInvited === false && transition.studentInvited ? 'on' : '';
  vars['itpAgencyNA'] = '';

  vars['itpAttendedIEP'] = cbEq(transition.studentParticipationMethod, 'Asistió al IEP');
  vars['itpAttendedIEP2'] = '';
  vars['itpQuestionnaire'] = cbEq(transition.studentParticipationMethod, 'Cuestionario');
  vars['itpQuestionnaire2'] = '';
  vars['itpAgeAppropYes'] = cb(transition.ageAppropriateTransitionAssessmentsUsed);
  vars['itpAgeAppropNo'] = cbNot(transition.ageAppropriateTransitionAssessmentsUsed);
  vars['itpAssessResults'] = s(transition.assessmentResultsDescription);

  // Transition goal tables
  const tg = transition.transitionGoals || [];
  const tgEd = tg[0] || {};
  const tgEmp = tg[1] || {};
  const tgIL = tg[2] || {};

  vars['itpEdGoal'] = s(transition.postsecondaryEducationGoal);
  vars['itpEdLinkedGoal'] = s(tgEd.connectedToAnnualGoalNumber as string);
  vars['itpEdResponsible'] = s(tgEd.responsiblePerson as string);
  vars['itpEdServiceCode'] = s(tgEd.transitionServiceCode as string);
  vars['itpEdActivities'] = s(tgEd.activitiesToSupportGoal as string);
  vars['itpEdCommunity'] = s(tgEd.communityExperiences as string);
  vars['itpEdRelatedSvcs'] = s(tgEd.relatedServices as string);

  vars['itpEmpGoal'] = s(transition.postsecondaryEmploymentGoal);
  vars['itpEmpLinkedGoal'] = s(tgEmp.connectedToAnnualGoalNumber as string);
  vars['itpEmpResponsible'] = s(tgEmp.responsiblePerson as string);
  vars['itpEmpServiceCode'] = s(tgEmp.transitionServiceCode as string);
  vars['itpEmpActivities'] = s(tgEmp.activitiesToSupportGoal as string);
  vars['itpEmpCommunity'] = s(tgEmp.communityExperiences as string);
  vars['itpEmpRelatedSvcs'] = s(tgEmp.relatedServices as string);

  vars['itpILGoal'] = s(transition.postsecondaryIndependentLivingGoal);
  vars['itpILLinkedGoal'] = s(tgIL.connectedToAnnualGoalNumber as string);
  vars['itpILResponsible'] = s(tgIL.responsiblePerson as string);
  vars['itpILServiceCode'] = s(tgIL.transitionServiceCode as string);
  vars['itpILActivities'] = s(tgIL.activitiesToSupportGoal as string);
  vars['itpILCommunity'] = s(tgIL.communityExperiences as string);
  vars['itpILRelatedSvcs'] = s(tgIL.relatedServices as string);

  // ITP page 2
  vars['itpGradRequirements'] = s(transition.graduationRequirements);
  vars['itpCourseDescYes'] = cb(transition.courseOfStudyMultiYear);
  vars['itpCourseDescNo'] = cbNot(transition.courseOfStudyMultiYear);
  vars['itpCreditsCompleted'] = s(transition.creditsCompleted);
  vars['itpCreditsPending'] = s(transition.creditsPending);
  vars['itpCertificate'] = cbEq(transition.leadingTo, 'Certificado de Finalización');
  vars['itpDiploma'] = cbEq(transition.leadingTo, 'Diploma');
  vars['itpExpectedGradDate'] = s(transition.expectedCompletionDate);
  vars['itpAltPathwayYes'] = cb(transition.alternativePathwayEligible);
  vars['itpAltPathwayNo'] = cbNot(transition.alternativePathwayEligible);

  vars['itpAgeOfMajority'] = cb(transition.majorityOfAgeNotified);
  vars['itpAgeNotifiedBy'] = s(transition.majorityOfAgeNotifiedBy);
  vars['itpAgeNotifiedDate'] = s(transition.majorityOfAgeNotifiedDate);

  vars['itpConservYes'] = cb(transition.underGuardianship);
  vars['itpConservNo'] = cbNot(transition.underGuardianship);

  vars['itpCheck1Yes'] = cb(transition.appropriatePostsecondaryMeasuresExist);
  vars['itpCheck1No'] = cbNot(transition.appropriatePostsecondaryMeasuresExist);
  vars['itpCheck2Yes'] = cb(transition.postsecondaryGoalsUpdatedWithAnnualIEP);
  vars['itpCheck2No'] = cbNot(transition.postsecondaryGoalsUpdatedWithAnnualIEP);
  vars['itpCheck3Yes'] = cb(transition.transitionServicesIncluded);
  vars['itpCheck3No'] = cbNot(transition.transitionServicesIncluded);
  vars['itpCheck4Yes'] = cb(transition.annualGoalsRelatedToTransition);
  vars['itpCheck4No'] = cbNot(transition.annualGoalsRelatedToTransition);

  // ── Emergency Plan ──
  const emSAI = emergencyPlan.specializedAcademicInstruction || {};
  vars['emSAIlessons'] = '';
  vars['emSAImeetings'] = cb(emSAI.interactiveClassMeetingsOnline);
  vars['emSAIinstruct'] = '';
  vars['emSAIappts'] = cb(emSAI.scheduledAppointmentsWithTeacher);
  vars['emSAIrecord'] = '';
  vars['emSAIoffice'] = '';
  vars['emSAIOther'] = '';
  vars['emSAIComments'] = '';

  const emTransNA = emergencyPlan.transitionServices === 'N/A';
  const emTransSame = emergencyPlan.transitionServices === 'IGUAL QUE ARRIBA';
  vars['emTransNA'] = cb(emTransNA);
  vars['emTransSame'] = cb(emTransSame);
  vars['emTransLessons'] = '';
  vars['emTransMeetings'] = '';
  vars['emTransInstruct'] = '';
  vars['emTransAppts'] = '';
  vars['emTransRecord'] = '';
  vars['emTransOffice'] = '';
  vars['emTransOther'] = '';
  vars['emTransComments'] = '';

  const emESYna = emergencyPlan.esyServices === 'N/A';
  const emESYsame = emergencyPlan.esyServices === 'IGUAL QUE ARRIBA';
  vars['emESYna'] = cb(emESYna);
  vars['emESYsame'] = cb(emESYsame);
  vars['emESYlessons'] = '';
  vars['emESYmeetings'] = '';
  vars['emESYinstruct'] = '';
  vars['emESYappts'] = '';
  vars['emESYrecord'] = '';
  vars['emESYoffice'] = '';
  vars['emESYother'] = '';
  vars['emESYcomments'] = '';

  vars['emSupLessons'] = '';
  vars['emSupMeetings'] = '';
  vars['emSupInstruct'] = '';
  vars['emSupAppts'] = '';
  vars['emSupRecord'] = '';
  vars['emSupOffice'] = '';
  vars['emSupOther'] = '';
  vars['emSupComments'] = '';

  // ── State Assessments ──
  const studentGradeRaw = s(student.grade);
  const studentGradeMatch = studentGradeRaw.match(/\d+/);
  const studentGradeLabel = studentGradeMatch
    ? String(Number(studentGradeMatch[0]))
    : studentGradeRaw;

  const ela = stateAssessments.ela;
  vars['caasppELAAccomm'] = ela.withAccommodations
    ? `Grado ${studentGradeLabel} — Con Adaptaciones`
    : `Grado ${studentGradeLabel} — Sin Adaptaciones`;
  vars['caasppELAdi'] = cb(ela.sbacDesignatedSupportsIntegrated);
  vars['caasppELAdni'] = cb(ela.sbacDesignatedSupportsNonIntegrated);
  vars['caasppELAai'] = cb(ela.sbacAdaptationsIntegrated);
  vars['caasppELAani'] = cb(ela.sbacAdaptationsNonIntegrated);
  vars['caasppELAacc'] = cb(ela.sbacAccessibilitySupport);
  vars['caasppELAdesignations'] = [
    s(ela.integratedSupportsDetail),
    s(ela.nonIntegratedSupportsDetail),
  ].filter(Boolean).join('; ');

  const math = stateAssessments.math;
  vars['caasppMathAccomm'] = math.withAccommodations
    ? `Grado ${studentGradeLabel} — Con Adaptaciones`
    : `Grado ${studentGradeLabel} — Sin Adaptaciones`;
  vars['caasppMathDI'] = cb(math.sbacDesignatedSupportsIntegrated);
  vars['caasppMathDNI'] = cb(math.sbacDesignatedSupportsNonIntegrated);
  vars['caasppMathAI'] = cb(math.sbacAdaptationsIntegrated);
  vars['caasppMathANI'] = cb(math.sbacAdaptationsNonIntegrated);
  vars['caasppMathACC'] = cb(math.sbacAccessibilitySupport);
  vars['caasppMathDesignations'] = [
    s(math.integratedSupportsDetail),
    s(math.nonIntegratedSupportsDetail),
    s(math.nonIntegratedAdaptationsDetail),
  ].filter(Boolean).join('; ');

  const sci = stateAssessments.science;
  vars['caasppSciAccomm'] = sci.withAccommodations
    ? `Grado ${studentGradeLabel} — Con Adaptaciones`
    : `Grado ${studentGradeLabel} — Sin Adaptaciones`;
  vars['caasppSciDI'] = cb(sci.castDesignatedSupportsIntegrated);
  vars['caasppSciDNI'] = cb(sci.castDesignatedSupportsNonIntegrated);
  vars['caasppSciAI'] = cb(sci.castAdaptationsIntegrated);
  vars['caasppSciANI'] = cb(sci.castAdaptationsNonIntegrated);
  vars['caasppSciACC'] = cb(sci.castAccessibilitySupport);
  vars['caasppSciDesignations'] = [
    s(sci.integratedSupportsDetail),
    s(sci.nonIntegratedSupportsDetail),
  ].filter(Boolean).join('; ');

  vars['caasppAltReviewed'] = cb(stateAssessments.takingAlternateAssessment);

  // Physical fitness
  vars['pftExempt'] = cbNot(stateAssessments.physicalFitness.gradeApplicable);
  vars['pftNoAccomm'] = cb(stateAssessments.physicalFitness.withoutAccommodations);
  vars['pftWithAccomm'] = cb(stateAssessments.physicalFitness.withAccommodations);
  vars['pftMod'] = cb(stateAssessments.physicalFitness.withModifications);
  vars['otherStateAssess'] = '';
  vars['drdp'] = '';
  vars['drdpNA'] = '';
  vars['drdpSensory'] = '';
  vars['drdpFunctional'] = '';
  vars['drdpAltResponse'] = '';
  vars['drdpEquip'] = '';
  vars['drdpVisual'] = '';
  vars['drdpAltWritten'] = '';
  vars['drdpAAC'] = '';

  // ELPAC assessment page
  const elpacAssess = stateAssessments.elpac;
  vars['elpacInitialAssess'] = '';
  vars['elpacSummativeComp'] = cb(elpacAssess.summativeELPAC);
  vars['elpacNoSupports'] = cb(elpacAssess.notApplicable);
  vars['elpacDI'] = cb(elpacAssess.designatedSupportsIntegrated);
  vars['elpacDNI'] = cb(elpacAssess.designatedSupportsNonIntegrated);
  vars['elpacAI'] = '';
  vars['elpacANI'] = '';
  vars['elpacDomainExempt'] = '';

  vars['altElpacInitialAssess'] = '';
  vars['altElpacSummativeAssess'] = '';
  vars['altElpacDI'] = '';
  vars['altElpacDNI'] = '';
  vars['altElpacANI'] = '';

  vars['csaCB'] = '';
  vars['csaDI'] = '';
  vars['csaDNI'] = '';
  vars['csaAI'] = '';
  vars['csaANI'] = '';

  // ── BIP ──
  vars['bipDate'] = s(bip.bipDate);
  vars['bipFBA'] = '';
  vars['bipData'] = '';
  vars['bipEmotional'] = '';
  vars['bipOther'] = '';
  vars['bipReportedBy'] = bip.reportedBy ? 'on' : '';
  vars['bipReportedByName'] = s(bip.reportedBy);
  vars['bipObservedBy'] = bip.observedBy ? 'on' : '';
  vars['bipAntecedents'] = s(bip.antecedents);
  vars['bipEnvironmentalSupports'] = s(bip.environmentalSupports);
  vars['bipAlgoMaterial'] = bip.functionalFactors.tangible ? 'on' : '';
  vars['bipEvadir'] = bip.functionalFactors.escapeProblem ? 'on' : '';
  vars['bipSensorial'] = bip.functionalFactors.sensoryIssue ? 'on' : '';
  vars['bipAtencion'] = bip.functionalFactors.attention ? 'on' : '';
  vars['bipReplacement'] = s(bip.ferbReplacementBehavior);
  vars['bipTeachingStrategies'] = s(bip.teachingStrategies);
  vars['bipReinforcement'] = s(bip.reinforcementProcedures);
  vars['bipEscalationStudent'] = '';
  vars['bipEscalationStaff'] = '';
  vars['bipDuringStudent'] = '';
  vars['bipDuringStaff'] = '';
  vars['bipDeescalationStudent'] = '';
  vars['bipDeescalationStaff'] = '';
  vars['bipAfterStudent'] = '';
  vars['bipAfterStaff'] = '';
  vars['bipGoalInIEP'] = cb(bip.behaviorGoalInIEP);

  // ── Reclassification ──
  vars['reclassPath1'] = '';
  vars['reclassPath2'] = '';
  vars['reclassPath3'] = '';

  // ── Excused Member (blank form) ──
  vars['studentExcusalName'] = `${name.last}, ${name.first}`;
  for (let i = 1; i <= 6; i++) {
    vars[`excusal${i}ColA`] = '';
    vars[`excusal${i}ColB`] = '';
    vars[`excusal${i}Full`] = '';
    vars[`excusal${i}Part`] = '';
  }
  vars['excusalSig1Padre'] = '';
  vars['excusalSig1Tutor'] = '';
  vars['excusalSig1Sub'] = '';
  vars['excusalSig2Padre'] = '';
  vars['excusalSig2Tutor'] = '';
  vars['excusalSig2Sub'] = '';

  // ── Manifestation Determination (blank form) ──
  vars['manifestDate'] = '';
  vars['residenceDistrict'] = s(district.responsibleDistrict);
  vars['manifestSchool'] = s(district.attendanceSchool);
  vars['manifestGrade'] = s(student.grade);
  vars['manifestSSID'] = s(student.ssid);
  vars['manifestGender'] = s(student.gender);
  vars['manifestParent'] = s(p1.name as string);
  vars['manifestHomePhone'] = s(p1.homePhone as string);
  vars['manifestAddress'] = s(p1.address as string);
  vars['manifestCity'] = s(p1.city as string);
  vars['manifestCell'] = s(p1.cellPhone as string);
  vars['manifestZip'] = s(p1.zip as string);
  vars['manifestEmail'] = s(p1.email as string);
  vars['manifestELyes'] = cb(student.isEL);
  vars['manifestELno'] = cbNot(student.isEL);
  vars['manifestNativeLang'] = s(student.nativeLanguage);
  vars['manifestDisability'] = s(eligibility.primaryDisability);
  vars['manifestSecDisability'] = s(eligibility.secondaryDisability);
  vars['manifestDisciplinaryAction'] = '';
  vars['manifestDisciplinaryDate'] = '';
  vars['manifestObsTeacher'] = '';
  vars['manifestIEPPlacement'] = '';
  vars['manifestParentInfo'] = '';
  vars['manifestOtherInfo'] = '';
  vars['manifestList1'] = '';
  vars['manifestDescribe'] = '';
  vars['manifestList2'] = '';
  vars['manifestList3'] = '';
  vars['manifestCausedYes'] = '';
  vars['manifestCausedNo'] = '';
  vars['manifestCausedComments'] = '';
  vars['manifestIEPfailYes'] = '';
  vars['manifestIEPfailNo'] = '';
  vars['manifestWasManif'] = '';
  vars['manifestFBA'] = '';
  vars['manifestBIPmod'] = '';
  vars['manifestNotManif'] = '';
  vars['manifestParentAgree'] = '';
  vars['manifestParentDisagree'] = '';
  vars['manifestProcRecYes'] = '';
  vars['manifestProcRecNo'] = '';
  vars['manifestSigPadre'] = '';
  vars['manifestSigEnc'] = '';
  vars['manifestSigSup'] = '';
  vars['manifestSigStudent'] = '';

  // ── Meeting Notices (blank forms) ──
  for (const n of ['notice1', 'notice2']) {
    vars[`${n}StudentName`] = `${name.last}, ${name.first}`;
    vars[`${n}Initial`] = '';
    vars[`${n}PlanReview`] = '';
    vars[`${n}Reeval`] = '';
    vars[`${n}Transition`] = '';
    vars[`${n}PreExp`] = '';
    vars[`${n}Interim`] = '';
    vars[`${n}Other`] = '';
    vars[`${n}Address`] = '';
    vars[`${n}ParentName`] = '';
    vars[`${n}TodayDate`] = '';
    vars[`${n}MeetingDate`] = '';
    vars[`${n}MeetingTime`] = '';
    vars[`${n}School`] = '';
    vars[`${n}Room`] = '';
    vars[`${n}AdminDes`] = '';
    vars[`${n}SpedTeacher`] = '';
    vars[`${n}GenEdTeacher`] = '';
    vars[`${n}Student`] = '';
    vars[`${n}Psychologist`] = '';
    vars[`${n}Specialist`] = '';
    vars[`${n}SpecialistType`] = '';
    for (let i = 1; i <= 6; i++) vars[`${n}Other${i}`] = '';
    vars[`${n}ContactName`] = '';
    vars[`${n}ContactTitle`] = '';
    vars[`${n}ContactSchool`] = '';
    vars[`${n}ContactPhone`] = '';
    vars[`${n}RSVPin`] = '';
    vars[`${n}RSVPphone`] = '';
    vars[`${n}RSVPothers`] = '';
    vars[`${n}RSVPinterp`] = '';
    vars[`${n}RSVPreschedule`] = '';
    vars[`${n}RSVPagency`] = '';
    vars[`${n}RSVPabsent`] = '';
    vars[`${n}RSVPrepresent`] = '';
    vars[`${n}SigPadres`] = '';
    vars[`${n}SigEnc`] = '';
    vars[`${n}SigSub`] = '';
    vars[`${n}SigAdult`] = '';
    vars[`${n}LEAComments`] = '';
  }

  // ── Evaluation Plan (blank form) ──
  vars['assessPlanDate'] = '';
  vars['assessInitial'] = '';
  vars['assessPlanReview'] = '';
  vars['assessReeval'] = '';
  vars['assessTransition'] = '';
  vars['assessInterim'] = '';
  vars['assessOther'] = '';
  vars['assessParentName'] = '';
  vars['assessPlanDate2'] = '';
  vars['assessDistrict'] = s(district.responsibleDistrict);
  vars['assessSchool'] = s(district.attendanceSchool);
  vars['assessGrade'] = s(student.grade);
  vars['assessNativeLang'] = s(student.nativeLanguage);
  vars['assessELProficiency'] = '';
  vars['assessAcademic'] = '';
  vars['assessAcademicExaminer'] = '';
  vars['assessHealth'] = '';
  vars['assessHealthExaminer'] = '';
  vars['assessIntellectual'] = '';
  vars['assessIntellectualExaminer'] = '';
  vars['assessComm'] = '';
  vars['assessCommExaminer'] = '';
  vars['assessMotor'] = '';
  vars['assessMotorExaminer'] = '';
  vars['assessSocialEmotional'] = '';
  vars['assessSocialExaminer'] = '';
  vars['assessAdaptive'] = '';
  vars['assessAdaptiveExaminer'] = '';
  vars['assessTransitionAssess'] = '';
  vars['assessTransitionExaminer'] = '';
  vars['assessOtherArea'] = '';
  vars['assessOtherExaminer'] = '';
  vars['assessAltMeans'] = '';
  vars['assessContactName'] = '';
  vars['assessContactPosition'] = '';
  vars['assessContactPhone'] = '';
  vars['assessContactEmail'] = '';
  vars['assessConsentYes'] = '';
  vars['assessConsentNo'] = '';
  vars['assessConsentMoreInfo'] = '';
  vars['assessSigPadre'] = '';
  vars['assessSigEnc'] = '';
  vars['assessSigSub'] = '';
  vars['assessSigAdult'] = '';

  // ── Notice of Action / Medi-Cal ──
  vars['mediCalYes'] = '';
  vars['mediCalNo'] = '';
  vars['mediCalSigPadre'] = '';
  vars['mediCalSigEnc'] = '';
  vars['mediCalSigSub'] = '';
  vars['mediCalSigAdult'] = '';
  vars['mediCalNoticeRcvd'] = '';
  vars['districtReceivedDate'] = '';
  vars['noaDate'] = '';
  vars['noaEvaluation'] = '';
  vars['noaPurposeOther'] = '';
  vars['noaProposedAction1'] = '';
  vars['noaProposedReason1'] = '';
  vars['noaProposedProcedures1'] = '';
  vars['noaProposedDate1'] = '';
  vars['noaOtherOptionsConsidered'] = '';
  vars['noaOtherOptionsRejected'] = '';
  vars['noaOtherFactors'] = '';
  vars['noaOtherOptionsCont'] = '';
  vars['noaContactName'] = '';
  vars['noaContactPosition'] = '';
  vars['noaContactPhone'] = '';
  vars['noaContactEmail'] = '';
  vars['noaIEPclosedDate'] = '';
  vars['noaIEPyes'] = '';
  vars['noaIEPna'] = '';

  // Service continuation page — populate svc2 and svc3 from services array
  vars['svcContinuationComment'] = '';

  const svcList = fapeServices.specialEdServices;
  for (let idx = 1; idx <= 2; idx++) {
    const prefix = `svc${idx + 1}`;
    const svc = svcList[idx];
    if (svc) {
      vars[`${prefix}Name`] = s(svc.service);
      vars[`${prefix}StartDate`] = s(svc.startDate);
      vars[`${prefix}EndDate`] = s(svc.endDate);
      vars[`${prefix}Provider`] = s(svc.provider);
      vars[`${prefix}Ind`] = svc.deliveryModel === 'Individual' ? 'on' : '';
      vars[`${prefix}Grp`] = svc.deliveryModel === 'Group' ? 'on' : '';
      vars[`${prefix}SecTrans`] = cb(svc.isSecTransition);
      vars[`${prefix}Duration`] = `${svc.minutesPerSession} min × ${svc.sessionsPerWeek}/sem = ${svc.totalMinutesPerWeek} min/sem (${svc.frequency})`;
      vars[`${prefix}Location`] = s(svc.location);
      vars[`${prefix}Comments`] = s(svc.comments);
    } else {
      vars[`${prefix}Name`] = '';
      vars[`${prefix}StartDate`] = '';
      vars[`${prefix}EndDate`] = '';
      vars[`${prefix}Provider`] = '';
      vars[`${prefix}Ind`] = '';
      vars[`${prefix}Grp`] = '';
      vars[`${prefix}SecTrans`] = '';
      vars[`${prefix}Duration`] = '';
      vars[`${prefix}Location`] = '';
      vars[`${prefix}Comments`] = '';
    }
  }

  return vars;
}

export function replaceVariables(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    return vars[key] ?? '';
  });
}
