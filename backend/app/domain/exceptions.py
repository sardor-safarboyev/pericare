class DomainException(Exception):
    """Barcha domain xatoliklari uchun bazaviy klass."""

    pass


class InvalidVitalsException(DomainException):
    """Klinik ko'rsatkichlar mantiqsiz yoki xato kiritilganda."""

    pass


class InvalidGestationalWeekException(DomainException):
    """Homiladorlik haftasi noto'g'ri kiritilganda."""

    pass


class RiskAssessmentAlreadyExistsException(DomainException):
    """Bitta vitals_reading uchun qayta xavf hisoblanmoqchi bo'lsa."""

    pass
