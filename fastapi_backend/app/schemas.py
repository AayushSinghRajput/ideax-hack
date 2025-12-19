from pydantic import BaseModel
from typing import Optional

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class Machine(BaseModel):
    toolName: Optional[str] = Field(
        None, description="Name of the machine/tool"
    )
    category: Optional[str] = Field(
        None, description="Category of the machine (Tractor, Tiller, Harvester)"
    )
    rentalPricePerHour: Optional[float] = Field(
        None, description="Rental price per hour"
    )
    availableFrom: Optional[date] = Field(
        None, description="Start date when the machine is available"
    )
    availableTo: Optional[date] = Field(
        None, description="End date when the machine is available"
    )
    location: Optional[str] = Field(
        None, description="Location where the machine is available"
    )
    pickupOption: Optional[str] = Field(
        None, description="Pickup option (Delivery, Self-Pickup, Both)"
    )
    rentalTerms: Optional[str] = Field(
        None, description="Rental terms and conditions"
    )
    machineImage: Optional[str] = Field(
        None, description="URL of the machine image"
    )
    cloudinaryId: Optional[str] = Field(
        None, description="Cloudinary public_id for image deletion"
    )


class AudioRequest(BaseModel):
    session_id: str
