# AppointmentsPage Implementation Plan

## Objective
Add "Book Appointment" button to AppointmentsPage that:
- Is only visible to clients
- Opens BookingModal component
- Uses lawyer from client's first accepted case
- Triggers appointments list refresh after booking

## Implementation Details

### State Additions
```jsx
const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
const [selectedLawyer, setSelectedLawyer] = useState(null);
const [refreshTrigger, setRefreshTrigger] = useState(0);
```

### Data Fetching
```jsx
useEffect(() => {
  if (isLawyer || !authData?.userId) return;
  
  const fetchClientCases = async () => {
    try {
      const cases = await caseService.getClientCases(authData.userId);
      const acceptedCase = cases.find(c => 
        c.status === 'ACCEPTED' && c.lawyer
      );
      if (acceptedCase) {
        setSelectedLawyer(acceptedCase.lawyer);
      }
    } catch (error) {
      console.error('Failed to fetch client cases:', error);
    }
  };
  
  fetchClientCases();
}, [authData?.userId, isLawyer]);
```

### Button Implementation
```jsx
{!isLawyer && selectedLawyer && (
  <button
    onClick={handleBookAppointment}
    className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
  >
    <CalendarPlus className="w-4 h-4" />
    Book Appointment
  </button>
)}
```

### BookingModal Integration
```jsx
{isBookingModalOpen && selectedLawyer && (
  <BookingModal
    lawyer={{
      id: selectedLawyer.userId,
      name: `${selectedLawyer.Fname} ${selectedLawyer.Lname}`,
      fee: selectedLawyer.fee || 'Consultation Fee Available'
    }}
    isOpen={isBookingModalOpen}
    onClose={handleCloseModal}
    onSuccess={handleAppointmentBooked}
  />
)}
```

### AppointmentsList Refresh
```jsx
<AppointmentsList refreshTrigger={refreshTrigger} />
```

## Dependencies
- `caseService.getClientCases()` must return cases with lawyer information
- AppointmentsList must accept `refreshTrigger` prop and refetch when it changes