import {
  AppBar,
  Badge,
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
  Divider,
  Grid,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import './App.css'

const navItems = [
  'Electronics',
  'Men',
  'Women',
  'Home',
  'Beauty',
  'Baby',
  'Toys',
  'Sports',
  'Automotive',
  'Grocery',
]

const heroSlides = [
  {
    title: 'Deals so good they sell out fast',
    subtitle: 'Mega offers across phones, beauty, fashion and home essentials.',
    tag: 'Up to 70% off',
    tone: 'hero-one',
  },
  {
    title: 'Everything for your summer plans',
    subtitle: 'Fresh picks, travel tech, beachwear and daily must-haves.',
    tag: 'Noon minutes',
    tone: 'hero-two',
  },
  {
    title: 'Bank deals, wallet rewards and free delivery',
    subtitle: 'Shop more categories with extra instant savings today.',
    tag: 'Extra 15%',
    tone: 'hero-three',
  },
]

const categories = [
  'Mobiles',
  'Laptops',
  'Fragrances',
  'Kitchen',
  'Watches',
  'Sneakers',
  'Makeup',
  'Furniture',
  'Gaming',
  'Appliances',
  'Bags',
  'Health',
]

const promoCards = [
  ['More reasons to shop', 'Free delivery, daily rewards, easy returns'],
  ['Noon One', 'Unlimited benefits and exclusive savings'],
  ['Clearance deals', 'Last-chance offers across top categories'],
]

const productSections = [
  {
    title: 'Recommended for you',
    products: [
      ['Smartphone 5G', 'AED 899', '4.5', 'Best seller', '#e7f0ff'],
      ['Wireless earbuds', 'AED 119', '4.3', 'Express', '#fff0d8'],
      ['Air fryer oven', 'AED 249', '4.6', 'Deal', '#eaf8ec'],
      ['Men running shoes', 'AED 139', '4.2', 'Limited', '#f7eaff'],
      ['Skin care set', 'AED 79', '4.4', 'New', '#ffe9ec'],
      ['Gaming monitor', 'AED 599', '4.7', 'Hot', '#e9f7ff'],
    ],
  },
  {
    title: 'Bestsellers in electronics',
    products: [
      ['Noise cancelling headphones', 'AED 299', '4.6', 'Express', '#eef4ff'],
      ['Laptop 15.6 inch', 'AED 1,799', '4.4', 'Sale', '#fef3d7'],
      ['Smart watch', 'AED 189', '4.1', 'New', '#ecfdf3'],
      ['Tablet 10 inch', 'AED 699', '4.5', 'Deal', '#f4ecff'],
      ['Portable speaker', 'AED 99', '4.0', 'Value', '#fff0f5'],
      ['Power bank', 'AED 59', '4.2', 'Fast', '#eafaff'],
    ],
  },
]

function ProductCard({ product, index }) {
  const [name, price, rating, label, color] = product

  return (
    <Paper className="product-card" elevation={0}>
      <Box className="product-art" sx={{ background: color }}>
        <span>{String(index + 1).padStart(2, '0')}</span>
      </Box>
      <Stack spacing={0.75} className="product-copy">
        <Typography variant="body2" className="product-name">
          {name}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography className="product-price">{price}</Typography>
          <Typography className="product-rating">★ {rating}</Typography>
        </Stack>
        <Chip size="small" label={label} className="product-chip" />
      </Stack>
    </Paper>
  )
}

function App() {
  return (
    <>
      <CssBaseline />
      <Box className="app-shell">
        <AppBar position="sticky" elevation={0} className="top-bar">
          <Toolbar className="main-toolbar">
            <Typography className="logo">noon</Typography>
            <Button className="delivery-btn">
              Deliver to
              <strong>Dubai</strong>
            </Button>
            <Paper className="search-box" elevation={0}>
              <InputBase
                fullWidth
                placeholder="What are you looking for?"
                inputProps={{ 'aria-label': 'search products' }}
              />
            </Paper>
            <Stack direction="row" alignItems="center" className="header-actions">
              <Button>العربية</Button>
              <Divider flexItem orientation="vertical" />
              <Button>Log in</Button>
              <Divider flexItem orientation="vertical" />
              <IconButton aria-label="wishlist">♡</IconButton>
              <Badge badgeContent={2} color="error">
                <IconButton aria-label="cart">🛒</IconButton>
              </Badge>
            </Stack>
          </Toolbar>
          <Box className="category-bar">
            <Button className="all-categories">All Categories ▾</Button>
            <Stack direction="row" className="nav-scroll">
              {navItems.map((item) => (
                <Button key={item}>{item}</Button>
              ))}
            </Stack>
          </Box>
        </AppBar>

        <main>
          <Container maxWidth={false} className="page-container">
            <Grid container spacing={1.5} className="hero-grid">
              <Grid item xs={12} lg={8.6}>
                <Swiper
                  modules={[Navigation, Pagination, Autoplay, A11y]}
                  navigation
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3500, disableOnInteraction: false }}
                  loop
                  className="hero-swiper"
                >
                  {heroSlides.map((slide) => (
                    <SwiperSlide key={slide.title}>
                      <Box className={`hero-slide ${slide.tone}`}>
                        <Stack spacing={2} className="hero-text">
                          <Chip label={slide.tag} className="hero-chip" />
                          <Typography variant="h1">{slide.title}</Typography>
                          <Typography>{slide.subtitle}</Typography>
                          <Button className="hero-btn">Shop now</Button>
                        </Stack>
                        <Box className="hero-stack">
                          <Box />
                          <Box />
                          <Box />
                        </Box>
                      </Box>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Grid>
              <Grid item xs={12} lg={3.4}>
                <Stack spacing={1.5} className="side-deals">
                  <Paper elevation={0}>
                    <Typography>Summer sale</Typography>
                    <strong>Extra cashback on cards</strong>
                  </Paper>
                  <Paper elevation={0}>
                    <Typography>Beauty rush</Typography>
                    <strong>Top picks under AED 99</strong>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>

            <Paper className="shortcut-strip" elevation={0}>
              <Swiper
                modules={[Navigation, A11y]}
                navigation
                slidesPerView={3.5}
                spaceBetween={14}
                breakpoints={{
                  600: { slidesPerView: 5.5 },
                  900: { slidesPerView: 8 },
                  1200: { slidesPerView: 10 },
                }}
              >
                {categories.map((category, index) => (
                  <SwiperSlide key={category}>
                    <Stack alignItems="center" spacing={1} className="shortcut">
                      <Box>{index + 1}</Box>
                      <Typography>{category}</Typography>
                    </Stack>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Paper>

            <Grid container spacing={1.5} className="promo-row">
              {promoCards.map(([title, text]) => (
                <Grid item xs={12} md={4} key={title}>
                  <Paper elevation={0} className="promo-card">
                    <Typography>{title}</Typography>
                    <strong>{text}</strong>
                    <Button>Explore</Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {productSections.map((section) => (
              <Paper className="product-section" elevation={0} key={section.title}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  className="section-heading"
                >
                  <Typography variant="h2">{section.title}</Typography>
                  <Button>View all</Button>
                </Stack>
                <Swiper
                  modules={[Navigation, A11y]}
                  navigation
                  slidesPerView={1.4}
                  spaceBetween={12}
                  breakpoints={{
                    520: { slidesPerView: 2.4 },
                    760: { slidesPerView: 3.4 },
                    1024: { slidesPerView: 5 },
                    1320: { slidesPerView: 6 },
                  }}
                >
                  {section.products.map((product, index) => (
                    <SwiperSlide key={`${section.title}-${product[0]}`}>
                      <ProductCard product={product} index={index} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Paper>
            ))}
          </Container>
        </main>
      </Box>
    </>
  )
}

export default App
