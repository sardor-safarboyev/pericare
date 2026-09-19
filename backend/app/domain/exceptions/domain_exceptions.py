class DomainError(Exception):
    """Barcha domen darajasidagi xatoliklarning bazaviy sinfi"""

    pass


class InvalidVitalsError(DomainError):
    pass


class InvalidGestationWeekError(DomainError):
    pass


class ReferralStateTransitionError(DomainError):
    pass
