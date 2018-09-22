library(tidyverse)
library(readxl)
library(lubridate)


sheets <- excel_sheets("Climate Agreement Data.xlsx")

paris <- read_xlsx("Climate Agreement Data.xlsx", range="A1:E181", sheet = sheets[1])
kyoto <- read_xlsx("Climate Agreement Data.xlsx", range="A1:D193", sheet = sheets[2])

paris_signed <- ymd("2015-12-12")
kyoto_signed <- ymd("1997-12-11")
doha_signed <- ymd("2012-12-08")

paris <- paris %>% 
  mutate(Country = str_trim(Country))

paris_totals <- paris %>%
  mutate(days_since_signed = ymd(paris$`Date of ratification, acceptance, approval, or accession`) - paris_signed) %>%
  count(days_since_signed) %>%
  mutate(treaty = "Paris") %>%
  arrange(days_since_signed) %>%
  mutate(total_countries = cumsum(n))

kyoto_totals <- kyoto %>%
  select(Country, `Ratification / Acceptance`) %>%
  mutate(days_since_signed = ymd(kyoto$`Ratification / Acceptance`) - kyoto_signed) %>%
  count(days_since_signed) %>%
  mutate(treaty = "Kyoto") %>%
  arrange(days_since_signed) %>%
  mutate(total_countries = cumsum(n))

doha_totals <- kyoto %>%
  select(Country, `Doha Amendment acceptance`) %>%
  mutate(days_since_signed = ymd(kyoto$`Doha Amendment acceptance`) - doha_signed) %>%
  count(days_since_signed) %>%
  mutate(treaty = "Doha") %>%
  arrange(days_since_signed) %>%
  mutate(total_countries = cumsum(n))

data <- bind_rows(paris_totals, kyoto_totals, doha_totals) %>%
  mutate(months_since_signed = days_since_signed/30)

ggplot(data, aes(x=days_since_signed, y=total_countries, color = treaty)) +
  geom_line()

write_csv(data, "country_sums.csv")


paris2 <- paris %>%
  mutate(days_since_signed = ymd(paris$`Date of ratification, acceptance, approval, or accession`) - paris_signed) %>%
  mutate(group = case_when(
    days_since_signed <= days(x=183) ~ 1,
    days_since_signed > days(x=183) & days_since_signed <= years(x=1) ~ 2,
    days_since_signed > years(x=1) & days_since_signed <= years(x=2) ~ 3,
    days_since_signed > years(x=2) ~ 4
  )) %>%
  rename(pct_greenhouse = `Percentage of greenhouse gases for ratification`,
         date_signature = `Date of signature`,
         date_ratified = `Date of ratification, acceptance, approval, or accession`) %>%
  mutate(pct_greenhouse = pct_greenhouse + 0.0001) %>%
  select(-`Date of enters into force`) %>%
  arrange(group, -pct_greenhouse)

write_csv(paris2, "paris_groups.csv")


# get historical GHG emissions per capita
historical_dat <- read_csv("historical_ghg_emissions.csv")
ggplot(historical_dat, aes(year, total_ghg_emissions, group = country)) +
  geom_line()

population_dat <- read_csv("Data_Extract_From_Population_estimates_and_projections/population.csv")
names(population_dat)[5:29] <- seq(1990, 2014)

population_dat_long <- population_dat %>%
  select(-`Series Name`, -`Series Code`, country_name = `Country Name`, country_code = `Country Code`) %>%
  gather(key = year, value = population, -country_name, -country_code) %>%
  mutate(year = as.numeric(year))

historical_pc <- historical_dat %>%
  inner_join(population_dat_long, by = c("country" = "country_name", "year")) %>%
  mutate(emissions_pc = total_ghg_emissions/as.numeric(population)) %>%
  filter(!is.na(emissions_pc))

ggplot(historical_pc, aes(year, emissions_pc, group=country)) +
  geom_line()

write_csv(historical_pc, "historical_emissions.csv")





forecast <- read_xlsx("Paris Agreement/Pathways/GCAM.xlsx", sheet = "GCAM_Timeseries data")

forecast_final <- forecast %>%
  rename(indicator = `ESP Indicator Name`, unit = `Unit of Entry`) %>%
  filter(indicator == "Emissions|GHG Emissions by gas with LULUCF|CO2") %>%
  gather(key = year, value = emissions, -Model, -Scenario, -Region, -indicator, -unit)

write_csv(forecast_final, "forecast.csv")
