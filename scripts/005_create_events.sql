-- Tabla de eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información del evento
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('networking', 'capacitacion', 'conferencia', 'taller', 'feria', 'reunion', 'otro')),
  
  -- Fechas y ubicación
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  location TEXT,
  location_url TEXT,
  is_virtual BOOLEAN DEFAULT false,
  virtual_link TEXT,
  
  -- Registro y capacidad
  max_attendees INTEGER,
  registration_required BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMPTZ,
  
  -- Organizador
  organizer_id UUID REFERENCES organizations(id),
  organizer_name TEXT,
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  is_public BOOLEAN DEFAULT true,
  
  -- Media
  image_url TEXT,
  
  -- Metadatos
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de asistentes
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- Puede ser usuario registrado o externo
  user_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  
  -- Datos del asistente (para externos)
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT,
  attendee_company TEXT,
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'cancelled', 'no_show')),
  
  -- Metadatos
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  attended_at TIMESTAMPTZ,
  
  UNIQUE(event_id, attendee_email)
);

-- RLS Policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Políticas para events
CREATE POLICY "Public events are viewable by everyone" ON events
  FOR SELECT USING (is_public = true AND status = 'published');

CREATE POLICY "Authenticated users can view all events" ON events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and editors can manage events" ON events
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- Políticas para attendees
CREATE POLICY "Anyone can register for events" ON event_attendees
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view attendees" ON event_attendees
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and editors can manage attendees" ON event_attendees
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_email ON event_attendees(attendee_email);

-- Trigger para updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
